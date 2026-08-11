import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // @libsql/client pulls in the `libsql` native Node addon — never bundle
  // it with webpack, just require() it at runtime like any other Node dep.
  serverExternalPackages: ['@libsql/client', 'libsql', '@web-portfolio/icons-db'],
}

export default nextConfig
