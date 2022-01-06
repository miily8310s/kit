import {
	PlaywrightTestArgs,
	PlaywrightTestConfig,
	PlaywrightTestOptions,
	PlaywrightWorkerArgs,
	PlaywrightWorkerOptions,
	TestType
} from '@playwright/test';
import { IncomingMessage, Server, ServerResponse } from 'http';

export const test: TestType<
	PlaywrightTestArgs &
		PlaywrightTestOptions & {
			app: {
				goto: (url: string) => Promise<void>;
				invalidate: (url: string) => Promise<void>;
				prefetch: (url: string) => Promise<void>;
				prefetchRoutes: (urls: string[]) => Promise<void>;
			};
			back: () => Promise<void>;
			clicknav: (selector: string) => Promise<void>;
			in_view: (selector: string) => Promise<boolean>;
			read_errors: (href: string) => string;
			started: () => Promise<void>;
		},
	PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

export const config: PlaywrightTestConfig;

export const start_server: (
	handler: (req: IncomingMessage, res: ServerResponse) => void,
	start?: number
) => {
	server: Server;
	port: number;
};
