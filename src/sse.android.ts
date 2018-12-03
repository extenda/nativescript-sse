import { BaseSSE } from './sse.common';
import { fromObject, Observable } from 'tns-core-modules/data/observable';

declare var com: any, java: any, WeakRef, okhttp3: any;

export class SSE extends BaseSSE {
    private _sseHandler: any;
    private _es: any;
    private _headers: any;
    private _url: any;
    protected events: Observable;

    constructor(url: string, headers: any = {}) {
        super(url, headers);
        this._url = new java.net.URI(url);
        this.events = fromObject({});
        const that = new WeakRef(this);
          const DarklyHandler = com.launchdarkly.eventsource.EventHandler.extend({
            owner: that.get(),
            onConnect() {
                this.owner.events.notify({
                    eventName: 'onConnect',
                    object: fromObject({
                        connected: true
                    })
                });
            },
            onMessage(event, message) {
                this.owner.events.notify({
                    eventName: 'onMessage',
                    object: fromObject({
                        event: event.toString(),
                        message: {
                            data: message.getData(),
                            lastEventId: message.getLastEventId(),
                            origin: message.getOrigin()
                        }
                    })
                });
            },
            onComment(comment) {
                this.owner.events.notify({
                    eventName: 'onComment',
                    object: fromObject({
                        comment: comment
                    })
                });
            },
            onError(e) {
                this.owner.events.notify({
                    eventName: 'onError',
                    object: fromObject({
                        error: e
                    })
                });
            },
            onClosed() {
                this.owner.events.notify({
                    eventName: 'onClosed',
                    object: fromObject({
                        onClosed: true
                    })
                });
            }
        });
        const DarklyConnectionErrorHandler = com.launchdarkly.eventsource.ConnectionErrorHandler.extend({
            owner: that.get(),
            onConnectionError(throwable) {
                this.owner.events.notify({
                    eventName: 'onConnectionError',
                    object: fromObject({
                        data: throwable
                    })
                });
                return null;
            }
        });

        this._sseHandler = new DarklyHandler();
        let headerBuilder = new okhttp3.Headers.Builder();
        for (let property in headers) {
            if (headers.hasOwnProperty(property)) {
                headerBuilder.add(property, headers[property]);
            }
        }
        this._headers = headerBuilder.build();
        try {
            this._es = new com.launchdarkly.eventsource.EventSource.Builder(this._sseHandler, this._url)
                .headers(this._headers)
                .reconnectTimeMs(200)
                .connectionErrorHandler(new DarklyConnectionErrorHandler())
                .build();
        } catch (error) {
            console.log(error);
        }
    }

    public addEventListener(event: string): void {
    }

    public removeEventListener(event: string): void {
    }

    public connect(): void {
        if (!this._es) return;
        this._es.start();
    }

    public close(): void {
        if (!this._es) return;
        this._es.close();
    }

}