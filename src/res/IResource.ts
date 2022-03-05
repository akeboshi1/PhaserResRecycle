export enum ResState {
    None,
    PreLoad,
    Loading,
    LoadComplete,
    LoadError,
    PreDispose,
    Disposed
}

export interface IResource {
    /**
     * 是否为静态不销毁资源
     */
    isStatic?: boolean;

    /**
     * 最后使用的时间戳
     */
    lastUseTime: number;

    /**
     * 资源当前状态
     */
    state: number;

    /**
     * 资源类型
     */
    resType: string;

    /**
     * 资源id
     */
    key: string;

    /**
     * 资源路径
     */
    url: string;

    /**
     * 销毁资源
     */
    dispose();
}
