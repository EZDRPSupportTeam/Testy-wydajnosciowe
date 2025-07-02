export class Cache {
    constructor(data) {
        this._dataSet = data ? data : {};
    }
    getData(key, section, subsection) {
        let dataObj = this._dataSet;
        if (subsection && subsection != '') {
            dataObj = dataObj[subsection];
        }

        if (section && section != '') {
            if (dataObj) {
                dataObj = dataObj[section];
            } else {
                return null;
            }
        }
        return dataObj ? dataObj[key] : null;
    }
    setData(key, value, section, subsection) {

        if (section && section != '') {
            if (subsection && subsection != '') {
                if (this._dataSet[subsection] === undefined || this._dataSet[subsection] == null) {
                    let tempDataObj = {};
                    tempDataObj[section] = {};
                    tempDataObj[section][key] = value;
                    this._dataSet[subsection] = tempDataObj;
                } else {
                    if (this._dataSet[subsection][section] === undefined || this._dataSet[subsection][section] == null) {
                        let tempDataObj = {};
                        tempDataObj[key] = value;
                        this._dataSet[subsection][section] = tempDataObj;
                    } else {
                        this._dataSet[subsection][section][key] = value;
                    }
                }
            } else {
                if (this._dataSet[section] === undefined || this._dataSet[section] == null) {
                    let tempDataObj = {};
                    tempDataObj[key] = value;
                    this._dataSet[section] = tempDataObj;
                } else {
                    this._dataSet[section][key] = value;
                }
            }
        } else {
            if (subsection && subsection != '') {
                if (this._dataSet[subsection] === undefined || this._dataSet[subsection] == null) {
                    let tempDataObj = {};
                    tempDataObj[key] = value;
                    this._dataSet[subsection] = tempDataObj;
                } else {
                    this._dataSet[subsection][key] = value;
                }
            } else {
                this._dataSet[key] = value;
            }
        }
    }
    getData0(key, section) {
        let dataObj = this._dataSet;
        if (section) {
            dataObj = dataObj[section];
        }
        return dataObj ? dataObj[key] : null;;
    }
    setData0(key, value, section) {
        let dataObj = this._dataSet;
        if (section) {
            dataObj = dataObj[section];
            if (dataObj === undefined || dataObj == null) {
                dataObj = {};
                dataObj[key] = value;
                this._dataSet[section] = dataObj;
                return;
            }
        }
        if (dataObj) {
            dataObj[key] = value;
        }
    }
    get dataSet() {
        return this._dataSet;
    }
}