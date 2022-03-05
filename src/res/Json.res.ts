import { IResource, ResState } from "./IResource";
export class JsonRes implements IResource {

    public key: string;
    public url: string;
    public resType: string;
    public lastUseTime: number;
    public state: number = ResState.None;

    constructor(key: string, url: string) {
        this.key = key;
        this.url = url;
    }

    dispose() {

    }
}
