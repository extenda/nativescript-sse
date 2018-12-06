import { Observable } from 'tns-core-modules/data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { SSE } from '@extenda/nativescript-okhttp-sse';
import { isAndroid } from 'tns-core-modules/platform';

export class HelloWorldModel extends Observable {
    list: ObservableArray<any>;
    sse: any;

    constructor() {
        super();
        this.list = new ObservableArray();
        this.sse = new SSE(isAndroid ? 'http://10.0.2.2:8000/' : 'http://localhost:8000/', {'X-Token': 'Test1234'});
        this.sse.events.on('onConnect', data => {
            console.log(data.object.connected);
        });

        this.sse.events.on('onMessage', data => {
            this.list.push(JSON.parse(data.object.message.data));
            console.dir(JSON.parse(data.object.message.data));
        });
        this.sse.events.on('onError', data => {
            console.log(data.object.error);
        });
    }
}
