from subprocess import check_call as cc
from pathlib import Path
import os
import requests

def get_url(dest, url):
  path = Path(dest)
  if path.exists(): return
  result = requests.get(url).text
  path.write_text(result)

def main():
  os.chdir(Path(__file__).resolve().parent)

  # ==============
  # === Client ===
  # ==============
  get_url('client/static/vendor/mithril.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/mithril/2.0.0-rc.4/mithril.min.js')#'https://unpkg.com/mithril/mithril.min.js')
  get_url('client/static/vendor/lodash.min.js', 'https://unpkg.com/lodash/lodash.min.js')
  get_url('client/static/vendor/msgpack-lite.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/msgpack-lite/0.1.26/msgpack.min.js')


  # ==============
  # === Server ===
  # ==============

  # Node modules
  npmmodules = [
    '@types/node',
    'lodash', '@types/lodash',
    # Hyperscript for HTML templating
    'hyperscript', '@types/hyperscript',
    # Express-related modules
    'express', '@types/express',
    'body-parser', '@types/body-parser',
    'cookie-parser', '@types/cookie-parser',
    'express-session', '@types/express-session',
    'memorystore', # '@types/memorystore',
    'csurf', '@types/csurf',
    # I always end up using websockets for something
    'ws', '@types/ws',
  ]
  cc(['yarn', 'add'] + npmmodules, cwd="server")

main()