const stringUtil = require('string');
const jwt = require('jwt-simple');
const secret = require('../open_api/controllers/authentication/secret');
const log = require('../../logger').LOG;
const HashMap = require('hashmap');
const fs = require('fs');
let myHashMap = new HashMap();

const utilities = {

    sendJSONresponse: (res, status, content) => {
        res.status(status);
        res.json(content);
    },
    createSuccessRespObject: (msg, payload) => {
        return {
            "status": "SUCCESS",
            "message": msg,
            "payload": payload
        };
    },
    createErrorRespObject: msg => {
        return {
            "status": "FAILED",
            "message": msg,
            "payload": null
        };
    },
    elapsedTime: startedTime => {
        let precision = 3; //Info: 3 decimal places
        let elapsed = process.hrtime(startedTime)[1] / 1000000; //Info: divide by a million to get nano to milli
        let str = process.hrtime(startedTime)[0] + " s, " + elapsed.toFixed(precision) + " ms";

        return str;
    },
    replaceAll: (inputString, find, replace) => {
        if(inputString==null){
            return inputString;
        }else {
            return stringUtil(inputString).replaceAll(find, replace).s;
        }
    },
    trimChar: (inputString, charToRemove) => {
        while(inputString.charAt(0)==charToRemove) {
            inputString = inputString.substring(1);
        }
    
        while(inputString.charAt(inputString.length-1)==charToRemove) {
            inputString = inputString.substring(0,string.length-1);
        }
    
        if(charToRemove!=' '){
            inputString = utilities.trimChar(inputString,' ');
        }

        return inputString;
    },
    logKnexException: e => {
        if (e) {
            const log = require('../../logger.js').LOG;
            log.debug('Knex Exception Error:')
            if (e.where) {
                log.debug(' - where: '+e.where);
            }
            if (e.message) {
                log.debug(' - message: '+e.message);
            }
        }
    },

    safeCharactersEscape: (inputString) => {
        return module.exports.replaceAll(inputString, '\'', '\'\'');
    },

    decodeJWT: accessToken => {
        let payload = null;
        if (accessToken) {
            payload = jwt.decode(accessToken, secret.getSecretKey());
        }

        return payload;
    },

    getTokenFromRequest: (req) => {
      let accessToken = null;
      try {
        accessToken = (req.body && req.body.access_token) || (req.params && req.params.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
        if (typeof accessToken === 'undefined') {
          if (req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') != -1) {
            accessToken = '' + req.headers['authorization'];
          }
        }

      } catch(err) {
        log.debug(err);
        accessToken = null;
      }

      return accessToken;
    },

    getTokenPayload: (req) => {
        let payload = null;
        let accessToken = null;
        try {
          accessToken = utilities.getTokenFromRequest(req);
          if(accessToken) {
            payload = utilities.decodeJWT(accessToken);
          }
        } catch(err) {
            log.debug(err);
            payload = null;
        }

        return payload;
    },

    isTokenExpire: (req) => {
        let expire = true;
        try {
            expire = utilities.getTokenPayload(req).exp <= Date.now();
        } catch (err) {
            log.debug(err);
            expire = true;
        }

        return expire;
    },

    getTokenCreationTimestamp: (req) => {
        let createdTimestamp = null;
        try {
            createdTimestamp = utilities.getTokenPayload(req).createdAt;
        } catch(err) {
            log.debug(err);
        }

        return createdTimestamp;
    },

    getCurrentLoginUserId: (req) => {
        let userId = -1;
        const tokenPayload = utilities.getTokenPayload(req);
        if (tokenPayload && tokenPayload.user && tokenPayload.user.id) {
            userId = tokenPayload.user.id;
        }

        return userId;
    },

    createUserSessionKey: (userId, timeStamp) => {
        return userId + '_@_' + timeStamp;
    },

    getUserSessionKey: (req) => {
        let sessionKey = null;
        const tokenPayload = utilities.getTokenPayload(req);
        if (tokenPayload) {
            sessionKey = utilities.createUserSessionKey(tokenPayload.user.id, tokenPayload.createdAt);
        }
        
        return sessionKey;
    },

    getSessionKeysStartWithUserId(userSessionCache, userId) {
        const sessionKeys = [];
        if (userSessionCache && userId) {
            const prefix = userId + '_@_';
            const keys = userSessionCache.getKeys();
            for (const key of keys) {
                if (key.startsWith(prefix)) {
                    sessionKeys.push(key);
                }
            }
        }

        return sessionKeys;
    },

    validateEmail(email) {
        var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
        return re.test(email);
    },

  cleanText(input_text) {
      if(input_text && input_text.length>0) {
        const cleanText = input_text.replace(/[\D]/gi, '');
        return cleanText;
      } else {
        return input_text;
      }
  },

  isPastDate(input_date_text) {
    if(input_date_text && input_date_text.length>0) {

      const input_date = new Date(input_date_text);
      const current_date = new Date();
      if(input_date.getTime() <= current_date.getTime()) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  },


  isDatesInOrder(input_date_text1, input_date_text2) {
    if(input_date_text1 && input_date_text1.length>0 && input_date_text2 && input_date_text2.length>0) {

      const input_date1 = new Date(input_date_text1);
      const input_date2 = new Date(input_date_text2);
      if(input_date1.getTime() <= input_date2.getTime()) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  },

  isFolderExist(path) {
    try {
      return fs.statSync(path).isDirectory();
    } catch (e) {
      if (e.code == 'ENOENT') { // no such directory
        log.debug(path + ' directory does not exist.');
        return false;
      }

      log.debug("Exception fs.statSync (" + path + "): " + e);
    }
  },

  createFolder(fullFolderPath) {
    const folderNameArray = fullFolderPath.split('/');
    let folderPath = "/";
    folderNameArray.map(folderName => {
      folderPath = `${folderPath}/${folderName}`;
      if (!this.isFolderExist(folderPath)) {
        fs.mkdirSync(folderPath);
      }
    });
  },

  randomIntFromInterval(min = 1, max = 100) { // min and max included
      return Math.floor(Math.random() * (max - min + 1) + min);
  },

  isANumber(inputText){

      let isThisANumber = false;
      try{
        const aNumber = parseInt(inputText);
      }catch(error){
        isThisANumber = false;
      }
      return isThisANumber;
  },

  isANumberArray(inputArray, callback) {
    let totalNonNumbers = 0;
    let iteration = 0;
    inputArray.map(singlekey => {
      if(isNaN(singlekey)){
        totalNonNumbers++;
        // callback(false);
      }
      iteration++;

      if (iteration === inputArray.length) {
        if (totalNonNumbers === 0) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
  },

  extractTimeFromTimestamp(timestamp) {
    if (timestamp) {
      const secondsInOneDay = 86400; // 24 hours * 60 minutes * 60 seconds
      const formatted_timestamp = parseInt(timestamp);
      if (formatted_timestamp > secondsInOneDay) {
        let formated_start_time = new Date(formatted_timestamp);
        let formated_start_date = new Date(formatted_timestamp);
        formated_start_date.setHours(0);
        formated_start_date.setMinutes(0);
        formated_start_date.setSeconds(0);
        const extracted_start_time = (formated_start_time.getTime() - formated_start_date.getTime())/1000;
        return extracted_start_time;
      } else {
        return formatted_timestamp;
      }
    } else {
      return 0;
    }
  },

  getSearchStringByTextKeyword(keyword, column_name){
    let searchQuery = ``;
    if (keyword) {
      keyword = keyword.trim().toUpperCase();
      if (keyword.length > 0) {
        keyword = keyword.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        searchQuery += ` AND (SUBSTRING(UPPER(${column_name}),'${keyword}') IS NOT NULL
        )`;
        return searchQuery;
      } else {
        return searchQuery;
      }
    } else {
      return searchQuery;
    }
  },

  getSearchStringByNumericKeyword(keyword, column_name){
    let searchQuery = ``;
    if (keyword) {
      keyword = keyword.trim();
      if (keyword.length > 0) {
        keyword = keyword.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
        searchQuery += ` AND (SUBSTRING(${column_name},'${keyword}') IS NOT NULL
        )`;
        return searchQuery;
      } else {
        return searchQuery;
      }
    } else {
      return searchQuery;
    }
  },

  getSearchStringByIdKeyword(keyword, column_name){
    let searchQuery = ``;
    if (keyword) {
      keyword = keyword.trim();
      if (keyword.length > 0) {
        searchQuery += ` AND ${column_name} = ${keyword})`;
        return searchQuery;
      } else {
        return searchQuery;
      }
    } else {
      return searchQuery;
    }
  },

  getSearchStringByQuery(keyword, query){
    let searchQuery = ``;
    if (keyword) {
      if (keyword.length > 0) {
        searchQuery += ` AND (${query})`;
        return searchQuery;
      } else {
        return searchQuery;
      }
    } else {
      return searchQuery;
    }
  },

  vaidateAPIPayload: (mandatory_inputs, payload, callback) => {
    let iteration = 0;
    let missed_input_data_array = [];
    let invalid_input_data_array = [];
    // let exceeded_input_data_array = [];
    // let nonequal_input_data_array = [];
    let valid_input_data_array = [];
    const totalInputs = mandatory_inputs.length;
    if(totalInputs > 0) {
      mandatory_inputs.map(mandatoryObject => {
        const inputValue = payload[mandatoryObject.id];
        if (mandatoryObject.type == "text") {
          if (mandatoryObject.required) {
            if (inputValue) {
              if(inputValue.length == 0) {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              } else if (mandatoryObject.length && (inputValue.length != mandatoryObject.length)) {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              } else if (mandatoryObject.max_length && (inputValue.length > mandatoryObject.max_length)) {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              } else {
                valid_input_data_array = [mandatoryObject.name];
              }
            } else {
              missed_input_data_array.push(`${mandatoryObject.name}`);
            }
          } else {
            if (inputValue) {
              if (mandatoryObject.length && (inputValue.length != mandatoryObject.length)) {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              } else if (mandatoryObject.max_length && (inputValue.length > mandatoryObject.max_length)) {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              } else {
                valid_input_data_array = [mandatoryObject.name];
              }
            }
          }
        } else if(mandatoryObject.type == "integer"){
          if (mandatoryObject.required) {
            if (inputValue) {
              try{
                const numberInputValue = parseInt(inputValue);
                const greater_than_zero = mandatoryObject.greater_than_zero ? (mandatoryObject.greater_than_zero == true) : false;
                if(greater_than_zero) {
                  if (numberInputValue <= 0) {
                    invalid_input_data_array.push(`${mandatoryObject.name}`);
                  } else if (mandatoryObject.max_value && (numberInputValue > mandatoryObject.max_value)) {
                    invalid_input_data_array.push(`${mandatoryObject.name}`);
                  } else {
                    valid_input_data_array = [mandatoryObject.name];
                  }
                } else {
                  valid_input_data_array = [mandatoryObject.name];
                }
              } catch(error){
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              }

            } else {
              missed_input_data_array.push(`${mandatoryObject.name}`);
            }
          } else {
            if (inputValue) {
              try {
                const numberInputValue = parseInt(inputValue);
                const greater_than_zero = mandatoryObject.greater_than_zero ? (mandatoryObject.greater_than_zero == true) : false;
                if (greater_than_zero) {
                  if (numberInputValue <= 0) {
                    invalid_input_data_array.push(`${mandatoryObject.name}`);
                  } else if (mandatoryObject.max_value && (numberInputValue > mandatoryObject.max_value)) {
                    invalid_input_data_array.push(`${mandatoryObject.name}`);
                  } else {
                    valid_input_data_array = [mandatoryObject.name];
                  }
                } else {
                  valid_input_data_array = [mandatoryObject.name];
                }
              } catch (error) {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              }
            }
          }
        } else if(mandatoryObject.type == "decimal"){
          if (mandatoryObject.required) {
            if (inputValue) {
              try{
                const numberInputValue = parseFloat(inputValue);
                const greater_than_zero = mandatoryObject.greater_than_zero ? (mandatoryObject.greater_than_zero == true) : false;
                if(greater_than_zero) {
                  if (numberInputValue <= 0) {
                    invalid_input_data_array.push(`${mandatoryObject.name}`);
                  } else {
                    valid_input_data_array = [mandatoryObject.name];
                  }
                } else {
                  valid_input_data_array = [mandatoryObject.name];
                }
              } catch(error){
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              }

            } else {
              missed_input_data_array.push(`${mandatoryObject.name}`);
            }
          } else {
            if (inputValue) {
              try {
                const numberInputValue = parseFloat(inputValue);
                const greater_than_zero = mandatoryObject.greater_than_zero ? (mandatoryObject.greater_than_zero == true) : false;
                if (greater_than_zero) {
                  if (numberInputValue <= 0) {
                    invalid_input_data_array.push(`${mandatoryObject.name}`);
                  } else {
                    valid_input_data_array = [mandatoryObject.name];
                  }
                } else {
                  valid_input_data_array = [mandatoryObject.name];
                }
              } catch (error) {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              }
            }
          }
        } else if(mandatoryObject.type == "date"){
          if (mandatoryObject.required) {
            if (inputValue) {
              if(utilities.validateDateFormat(inputValue)){
                valid_input_data_array.push(`${mandatoryObject.name}`);
              } else {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              }
            } else {
              missed_input_data_array.push(`${mandatoryObject.name}`);
            }
          } else {
            if (inputValue) {
              if (utilities.validateDateFormat(inputValue)) {
                valid_input_data_array.push(`${mandatoryObject.name}`);
              } else {
                invalid_input_data_array.push(`${mandatoryObject.name}`);
              }
            }
          }
        } else if (mandatoryObject.type == "array") {
          const greater_than_zero = mandatoryObject.greater_than_zero ? (mandatoryObject.greater_than_zero == true) : false;
          if (mandatoryObject.required) {
            if (inputValue) {
              if(greater_than_zero) {
                if (inputValue.length == 0) {
                  invalid_input_data_array.push(`${mandatoryObject.name}`);
                } else {
                  valid_input_data_array = [mandatoryObject.name];
                }
              } else {
                valid_input_data_array = [mandatoryObject.name];
              }
            } else {
              missed_input_data_array.push(`${mandatoryObject.name}`);
            }
          } else {
            if (inputValue) {
              if(greater_than_zero) {
                if (inputValue.length == 0) {
                  invalid_input_data_array.push(`${mandatoryObject.name}`);
                } else {
                  valid_input_data_array = [mandatoryObject.name];
                }
              } else {
                valid_input_data_array = [mandatoryObject.name];
              }
            }
          }
        }
        iteration++;
        if (iteration == totalInputs) {
          const totalMissed = missed_input_data_array.length;
          const totalInvalid = invalid_input_data_array.length;
          const totalErrors = totalMissed + totalInvalid;
          let errorMessage = ``;
          if (totalErrors > 0) {

            utilities.humanizeArrayItems(missed_input_data_array, function(humanizedText) {
              errorMessage = totalMissed > 0 ? (
                totalMissed == 1
                  ? `${humanizedText} is required`
                  : `${humanizedText} are required`
              ) : ``;

              if (errorMessage.length > 0 && totalInvalid > 0) {
                errorMessage += `. Also `;
              }
              utilities.humanizeArrayItems(invalid_input_data_array, function(humanizedText) {
                errorMessage += totalInvalid > 0 ? (
                  totalInvalid == 1
                    ? `${humanizedText} is invalid`
                    : `${humanizedText} are invalid`
                ) : ``;
                callback(errorMessage, null);
              });
            });
          } else {
            callback(null, true);
          }
        }
      });
    } else {
      callback(null, true);
    }
  },

  validateDateFormat: (inputText) => {
    var dateformat = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
    // Match the date format through regular expression
    // Supported format yyyy-mm-dd  or yyyy/mm/dd
    if(inputText.match(dateformat)) {
      //Test which seperator is used '/' or '-'
      var opera1 = inputText.split('/');
      var opera2 = inputText.split('-');
      lopera1 = opera1.length;
      lopera2 = opera2.length;
      // Extract the string into month, date and year
      if (lopera1>1) {
        var pdate = inputText.split('/');
      }
      else if (lopera2>1) {
        var pdate = inputText.split('-');
      }
      var yy = parseInt(pdate[0]);
      var mm  = parseInt(pdate[1]);
      var dd = parseInt(pdate[2]);
      // Create list of days of a month [assume there is no leap year by default]
      var ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];
      if (mm==1 || mm>2) {
        if (dd>ListofDays[mm-1]) {
          return false;
        }
      }
      if (mm==2) {
        var lyear = false;
        if ( (!(yy % 4) && yy % 100) || !(yy % 400)) {
          lyear = true;
        }
        if ((lyear==false) && (dd>=29)) {
          return false;
        }
        if ((lyear==true) && (dd>29)) {
          return false;
        }
      }
    } else {
      return false;
    }

    return true;
  },

  humanizeArrayItems: (inputArray, callback) => {
    let result = inputArray;
    if (inputArray) {
      const totalItems = inputArray.length;
      if (totalItems > 1) {

        let iteration = 1;
        inputArray.map(itemText => {
          if (iteration === 1) {
            result = itemText;
          } else if (iteration === totalItems) {
            result = `${result} and ${itemText}`;
            callback(result);
          } else {
            result = `${result}, ${itemText}`;
          }
          iteration++;
        });
      } else {
        callback(result);
      }
    } else {
      callback(result);
    }
  },
};

module.exports = utilities;

/*
OTher useful utility modules

OS Module 
Provides basic operating-system related utility functions.
2
Path Module 
Provides utilities for handling and transforming file paths.
3
Net Module 
Provides both servers and clients as streams. Acts as a network wrapper.
4
DNS Module 
Provides functions to do actual DNS lookup as well as to use underlying operating system name resolution functionalities.
5
Domain Module 
Provides ways to handle multiple different I/O operations as a single group.

*/