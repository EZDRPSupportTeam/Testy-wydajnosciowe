class _Config {
    constructor() {
    }

    getConfig(key) {
        return __ENV[key];
    }
}

const Config = new _Config();

export { Config as SysConfig };