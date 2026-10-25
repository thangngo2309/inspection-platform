
import type { NextConfig } from 'next';
import { config } from 'dotenv';
import path from 'node:path';

const workspaceRoot = path.resolve(process.cwd(), '../..');

config({
  path: path.join(workspaceRoot, '.env'),
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
