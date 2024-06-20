import {
    Configuration,
    HtmlRspackPlugin,
    SwcLoaderOptions,
    rspack,
} from '@rspack/core';
import { RspackDevServer } from '@rspack/dev-server';
import * as path from 'path';
import * as fs from 'fs/promises';

const getOptions = (tsx?: boolean): SwcLoaderOptions => {
    return {
        env: {
            targets: ['ie >= 11', 'chrome >= 49', 'safari >= 10'],
            coreJs: '3.21',
        },
        module: {
            type: 'commonjs',
        },
        sourceMaps: true,
        jsc: {
            parser: {
                dynamicImport: true,
                syntax: 'typescript',
                tsx,
            },
            externalHelpers: true,
            transform: {
                react: {
                    runtime: 'automatic',
                    development: true,
                },
            },
        },
    };
};

const run = async () => {
    const templateContent = await fs.readFile('./index.html', {
        encoding: 'utf-8',
    });

    const resPackConfig: Configuration = {
        entry: './src/index.tsx',
        mode: 'development',
        output: {
            filename: `demo/[name].js`,
            publicPath: `//localhost:80/`,
            assetModuleFilename: `demo/assets/[name].[contenthash:8][ext]`,
        },
        resolve: {
            modules: [
                path.join(process.cwd(), './node_modules'),
                './node_modules',
                './',
            ],
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
        devtool: false,
        cache: true,
        stats: 'errors-warnings',
        module: {
            rules: [
                {
                    test: /\.(mjs|js|ts)$/,
                    include: [path.resolve(process.cwd(), './src'), path.resolve(process.cwd(), './node_modules/swiper')],
                    use: {
                        loader: 'builtin:swc-loader',
                        options: getOptions(false),
                    },
                    type: 'javascript/auto', // Comment out this line of code, and the error will occur.
                },
                {
                    test: /\.(jsx|tsx)$/,
                    include: [path.resolve(process.cwd(), './src'), path.resolve(process.cwd(), './node_modules/swiper')],
                    use: {
                        loader: 'builtin:swc-loader',
                        options: getOptions(true),
                    },
                    type: 'javascript/auto', // Comment out this line of code, and the error will occur.
                },
            ],
        },
        plugins: [
            new HtmlRspackPlugin({
                title: 'demo',
                templateContent,
                filename: 'demo/index.html',
                inject: 'body',
                minify: false,
            }),
        ],
    };

    const compiler = rspack(resPackConfig);

    const server = new RspackDevServer(
        {
            port: 80,
            hot: false,
        } as any,
        compiler
    );

    await server.start();
};

run();