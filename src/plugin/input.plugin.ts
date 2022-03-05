export class InputPlugin extends Phaser.Input.InputPlugin {
    /**
     * Phaser multiple click interval
     * In the interval, no longer emit `pointer` event
     */
    static CLICK_PROTECTION_DELAY_MS = 300;
    protected lastDownTimestamp: number = 0;
    protected lastUpTimestamp: number = 0;

    /**
     * An internal method that handles the Pointer down event.
     *
     * @method Phaser.Input.InputPlugin#processDownEvents
     * @protected
     * @fires Phaser.Input.Events#GAMEOBJECT_POINTER_DOWN
     * @fires Phaser.Input.Events#GAMEOBJECT_DOWN
     * @fires Phaser.Input.Events#POINTER_DOWN
     * @fires Phaser.Input.Events#POINTER_DOWN_OUTSIDE
     * @since 3.0.0
     *
     * @param {Phaser.Input.Pointer} pointer - The Pointer being tested.
     *
     * @return {number} The total number of objects interacted with.
     */
    protected processDownEvents(pointer: Phaser.Input.Pointer) {
        if (InputPlugin.CLICK_PROTECTION_DELAY_MS > Date.now() - this.lastDownTimestamp) {
            // @ts-ignore
            return this._temp ? this._temp.length : 0;
        }
        this.lastDownTimestamp = Date.now();
        // @ts-ignore
        return super.processDownEvents(pointer);
    }

    /**
     * An internal method that handles the Pointer up events.
     *
     * @method Phaser.Input.InputPlugin#processUpEvents
     * @protected
     * @fires Phaser.Input.Events#GAMEOBJECT_POINTER_UP
     * @fires Phaser.Input.Events#GAMEOBJECT_UP
     * @fires Phaser.Input.Events#POINTER_UP
     * @fires Phaser.Input.Events#POINTER_UP_OUTSIDE
     * @since 3.0.0
     *
     * @param {Phaser.Input.Pointer} pointer - The pointer to check for events against.
     *
     * @return {number} The total number of objects interacted with.
     */
     protected processUpEvents(pointer: Phaser.Input.Pointer) {
        if (InputPlugin.CLICK_PROTECTION_DELAY_MS > Date.now() - this.lastUpTimestamp) {
            // @ts-ignore
            return this._temp ? this._temp.length : 0;
        }
        this.lastUpTimestamp = Date.now();
        // @ts-ignore
        return super.processUpEvents(pointer);
    }
}

Phaser.Plugins.PluginCache.register("InputPlugin", InputPlugin, "input");
