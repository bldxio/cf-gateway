import useReflare from 'reflare'
import { toHex, nh } from './utils'

interface Env {
  DEPTH: number
  RESOLVER: KVNamespace
}

const e404 = `
<!DOCTYPE html>
<body>
  <div style="font-family:-apple-system, BlinkMacSystemFont, Roboto, &quot;Segoe UI&quot;, &quot;Fira Sans&quot;, Avenir, &quot;Helvetica Neue&quot;, &quot;Lucida Grande&quot;, sans-serif;height:100vh;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center">
    <div>
      <style>
          body { margin: 0; color: #000; background: #fff; }
          .next-error-h1 {
            border-right: 1px solid rgba(0, 0, 0, .3);
          }

          @media (prefers-color-scheme: dark) {
            body { color: #fff; background: #000; }
            .next-error-h1 {
              border-right: 1px solid rgba(255, 255, 255, .3);
            }
          }
      </style>
      <h1 class="next-error-h1" style="display:inline-block;margin:0;margin-right:20px;padding:0 23px 0 0;font-size:24px;font-weight:500;vertical-align:top;line-height:49px">404</h1>
      <div style="display:inline-block;text-align:left;line-height:49px;height:49px;vertical-align:middle">
        <h2 style="font-size:14px;font-weight:normal;line-height:49px;margin:0;padding:0">This site could not be found<!-- -->.</h2>
      </div>
   </div>
  </div>
</body>
`

function err404(fqn = '', namehash = '', owner = '', ptr = '') {
  return new Response(e404, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'x-crtx-fqn': fqn,
      'x-crtx-namehash': namehash,
      'x-crtx-owner': owner,
      'x-crtx-ptr': ptr,
    },
    status: 404
  })
}


export default {
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const reflare = await useReflare()
    const { DEPTH, RESOLVER } = env

    const url = new URL(request.url)
    const fqn = url.host.split('.').slice(0, (DEPTH * -1)).join('.')
    const namehash = toHex(nh(fqn))

    const { owner }: { owner?: string }
      = await RESOLVER.get(`domain:${namehash}`, 'json') || {}
    if (!owner) return err404(fqn, namehash, owner)

    const { metadata }: { metadata?: any }
      = await RESOLVER.getWithMetadata(`channels:${owner}:${namehash}`) || {}
    if (!metadata) return err404(fqn, namehash, owner)

    const [ptr]: string[]
      = await RESOLVER.get(`note:${metadata.addr}`, 'json') || []
    if (!ptr) return err404(fqn, namehash, owner, ptr)

    const gateway = 'bproto.mypinata.cloud'

    reflare.push({
      path: '/*',
      upstream: {
        domain: gateway,
        protocol: 'https',
        timeout: 30000,
        onRequest: (request: Request, url: string): Request => {
          let newURL = new URL(url)
          newURL.pathname = `/ipfs/${ptr}/${newURL.pathname}`
          return new Request(newURL.toString(), request)
        }
      },
      headers: {
        response: {
          'x-crtx-fqn': fqn,
          'x-crtx-namehash': namehash,
          'x-crtx-owner': owner,
          'x-crtx-ptr': ptr || '',
          'x-crtx-gateway': gateway,
          'x-crtx-method': request.method,
          'Cache-Control': 'public, max-age=600',
          'Content-Security-Policy': `default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://*;`
        }
      }
    });

    return reflare.handle(request)
  }
}
