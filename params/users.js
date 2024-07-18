import { SysConfig } from '../utils/sys-config.js'
import { SharedArray } from "k6/data";
import { log } from "../utils/log.js";
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { randomIntMax } from '../utils/random.js'

const data = function () {
    return new SharedArray("users.params", function () {
        let envUsersFile = __ENV['USERS_FILENAME'];
        let filesPriority = new Array();
        if (envUsersFile === undefined || envUsersFile === 'undefined' || envUsersFile === '') {
            let url = __ENV['KUIP_URL_EZDRP'];
            if (url === undefined || url === '') {
                url = __ENV['URL_EZDRP'];
            }
            let filenamePostfix = '';
            if (url !== '') {
                let urlObj = new URL(url);
                let urlDomain = urlObj.hostname;
                if (urlDomain !== undefined && urlDomain !== '') {
                    filesPriority.push(`./input/users-${urlDomain}.json`);

                }
            }
        } else {
            filesPriority.push(envUsersFile);
        }
        let fileContent = '';
        let envUrl = __ENV['KUIP_URL_EZDRP'];
        if (envUrl !== undefined && envUrl !== '') {
            filesPriority.push(`./input/users-kuip.json`);
        }
        envUrl = __ENV['URL_EZDRP'];
        if (envUrl !== undefined && envUrl !== '') {
            filesPriority.push(`./input/users.json`);
        }
        for (let i = 0; i < filesPriority.length; i++) {
            let fileToCheck = filesPriority[i];
            try {
                fileContent = open(`${fileToCheck}`);
                log(`read users from ${fileToCheck}`);
                break;
            } catch (e) {

            }
        }
        let usersParam = JSON.parse(fileContent);

        let isRolesMappingExists = usersParam.roles_map !== undefined && usersParam.roles_splitter !== undefined && usersParam.roles_splitter !== '';
        let isUzytkownikStanowiskoMappingExists = usersParam.uzytkownik_stanowisko_rola_map !== undefined;
        let userLoginFormat = usersParam.login_format;
        let generatedUsersParam = { users: new Array() };
        let p1Array = new Array();
        let p2Array = new Array();
        let p3Array = new Array();
        let readPArray = function (ap) {
            if (ap.from !== undefined && ap.from > 0 && ap.to !== undefined && ap.to > 0) {
                let returnArray = new Array();
                for (let i = ap.from; i <= ap.to; i++) {
                    returnArray.push(i);
                }
                return returnArray;
            } else if (ap.array !== undefined && ap.array.length > 0) {
                return ap.array;
            }
            return new Array();
        };

        let getUserRoles = function (l) {
            let roles = [];
            if (usersParam.roles_map !== undefined) {
                usersParam.roles_map.forEach((r) => {
                    if (r.login.includes(l) && !roles.includes(r.key)) {
                        roles.push(r.key);
                    }
                });
            }
            if (usersParam.roles_default !== undefined && usersParam.roles_default.roles !== undefined && (usersParam.roles_default.excluded_logins === undefined || !usersParam.roles_default.excluded_logins.includes(l))) {

                if (usersParam.roles_default.excluded_roles) {
                    for (let r of usersParam.roles_default.excluded_roles) {
                        if (roles.includes(r)) {
                            return roles;
                        }
                    }
                }
                roles.push(...usersParam.roles_default.roles);
            }
            return roles;
        };
        let addUser = function (l) {
            let newUser = { login: l, password: usersParam.password };
            if (isRolesMappingExists) {
                let userRoleKey = newUser.login.split(usersParam.roles_splitter)[0];
                newUser["roles"] = getUserRoles(userRoleKey);
            }
            if (isUzytkownikStanowiskoMappingExists) {
                let userRoleKey = newUser.login.split(usersParam.roles_splitter)[0];
                for (let usm of usersParam.uzytkownik_stanowisko_rola_map) {
                    if (usm.key === userRoleKey) {
                        newUser["stanowiska_map"] = usm.stanowiska;
                    }
                }
            }
            generatedUsersParam.users.push(newUser);
        };
        if (usersParam.p1) {
            p1Array = readPArray(usersParam.p1);
        }
        if (usersParam.p2) {
            p2Array = readPArray(usersParam.p2);
            const podmiotStartEnv = __ENV['PODMIOT_START'];            
            const podmiotStart = parseInt(podmiotStartEnv, 10);
            if (podmiotStart > 0) {
                log(`start podmiot: ${podmiotStart}`);
                p2Array = p2Array.filter(item => item >= podmiotStart);
            }            
            const podmiotSkipEnv = __ENV['PODMIOT_SKIP'];
            const podmiotSkip = parseInt(podmiotSkipEnv, 10);
            if (!isNaN(podmiotSkip) && podmiotSkip > 0 && podmiotSkip < p2Array.length) {
                log(`skip podmiot: ${podmiotSkip}`);
                p2Array = p2Array.slice(podmiotSkip);
            }         
        }
        if (usersParam.p3 !== undefined && usersParam.p3 !== null) {
            p3Array = readPArray(usersParam.p3);
        }
        if (usersParam.users) {
            usersParam.users.forEach((u) => {
                addUser(u.login);
            });
        }
        p2Array.forEach((p2Item) => {
            if (p1Array.length > 0) {
                p1Array.forEach((p1Item) => {
                    if (p3Array.length > 0) {
                        p3Array.forEach((p3Item) => {
                            addUser(userLoginFormat.replace('$1$', `${p1Item}`).replace('$2$', `${p2Item}`).replace('$3$', `${p3Item}`));
                        });
                    } else {
                        addUser(userLoginFormat.replace('$1$', `${p1Item}`).replace('$2$', `${p2Item}`));
                    }
                });
            } else {

                log(`brak lub nieprawidlowy parametr p1`);
            }
        });
        generatedUsersParam.roles_map = usersParam.roles_map;
        const debugParams = __ENV['DEBUG_PARAMS'];
        if (debugParams && debugParams !== '') {
            log(generatedUsersParam);
        } else {
            let firstUser = generatedUsersParam.users ? generatedUsersParam.users.at(0).login : '';
            let lastUser = generatedUsersParam.users ? generatedUsersParam.users.at(-1).login : '';
            log(`users count: ${generatedUsersParam.users ? generatedUsersParam.users.length : -1}, FIRST: ${firstUser}  LAST:${lastUser}`);
        }
        let dataArray = new Array();
        dataArray.push(generatedUsersParam);
        return dataArray;


    });
}();
const CONFIGKEY_RANDOM = "USERS_RANDOM";
class _ParamsUsers {
    constructor() {

    }
    static init() {

    }
    static getUserNamesByRole(roleName) {
        let users = new Array();
        let inputData = data[0];
        if (inputData.roles_map === undefined || inputData.roles_map.length <= 0) {
            return users;
        }
        for (let role of inputData.roles_map) {
            if (role.key !== undefined && role.key === roleName && role.name !== undefined && role.name.length > 0) {
                users.push(...role.name);
                break;
            }
        }
        return users;
    }
    static isUserParamContainsRole(userLogin, roleName, returnValueForNoRoles) {
        let inputData = data[0];
        for (let usr of inputData.users) {
            if (usr.login === userLogin && usr.roles !== undefined) {
                return usr.roles.includes(roleName);
            }
        }
        return returnValueForNoRoles === undefined ? false : returnValueForNoRoles;
    }
    static getUserByLogin(userLogin) {
        let inputData = data[0];
        for (let user of inputData.users) {
            if (user.login === userLogin) {
                return user;
            }
        }
        return null;
    }
    static getUserParams(input) {
        let userId = input && input.userId > 0 ? input.userId - 1 : 0;
        let iterationId = input && input.iterationId >= 0 ? input.iterationId : 0;
        let inputData = data[0];

        if (!inputData || inputData.users === undefined || inputData.users.length <= 0) {
            throw 'no users params data';
        }
        let usersRandom = SysConfig.getConfig(CONFIGKEY_RANDOM) == "1";

        if (usersRandom || userId >= inputData.users.length) {
            return inputData.users[randomIntMax(inputData.users.length)];
        }
        let userData = inputData.users[userId];

        return userData;
    }
    static getUserJrwaFromWykaz(wykaz, user) {
        if (!wykaz || wykaz.length <= 0) {
            log(`jrwa list empty for ${user.login}`);
            return null;
        }
        return wykaz[randomIntMax(wykaz.length)];
    }
}

export { _ParamsUsers as ParamsUsers }