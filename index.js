var error = false;
var go = document.querySelectorAll('.button')[0];

function run() {
    resetError();
    resetTable();
    var inputs = document.querySelectorAll('th input');
    var one = inputs[0].value,
        two = inputs[1].value;

    if(!(one && two)) {
        errorMessage('Please enter two curl strings for comparison');
    }
    if(one.indexOf('curl ') || two.indexOf('curl ')) {
        errorMessage('Must compare curl commands');
    }
    if(!error) {
        // do comparison stuff here
        var table = document.querySelectorAll('.table')[0];
        var struct = consolidateObjects( convertToObject(splitCommand(one)), convertToObject(splitCommand(two)) );
        iterateStruct(struct, table, 'category');
    }
}

function iterateStruct(struct, table, rowClass) {
    for (prop in struct) {
        if (struct.hasOwnProperty(prop)) {
            var rowData = struct[prop];
            var row = makeTr();
            row.className += (' ' + rowClass);
            var catTd = makeTd(prop);
            catTd.className = checkArrayElementDiff(rowData) ? 'different' : 'same';
            row.appendChild(catTd);
            for(var i = 0; i < rowData.length; i++) {
                row.appendChild(makeTd(rowData[i] || (rowData[i] === '' ? '' : '-')))
            }
            if(prop === 'Url' || rowData.some(function(d){return d.indexOf('http') === 0;})) {
                var extras = consolidateObjects(queryStringToObject(rowData[0]), queryStringToObject(rowData[1]));
                iterateStruct(extras, row, 'sub-category');
            }
            if(prop === 'Cookie') {
                var extras = consolidateObjects(cookieStringToObject(rowData[0]), cookieStringToObject(rowData[1]));
                iterateStruct(extras, row, 'sub-category');
            }
            table.appendChild(row);
        }
    }
}

function checkArrayElementDiff(arr) {
    var diff = false;
    for(var i = 1; i < arr.length; i++) {
        if (arr[i] !== arr[i-1]) {
            diff = true;
        }
    }
    return diff;
}

function queryStringToObject(string) {
    var queryIdx = string.indexOf('?');
    var result = {};
    if (queryIdx > -1) {
        var query = string.substring(queryIdx + 1);
        query.split("&").forEach(function(part) {
          var item = part.split("=");
          result[item[0]] = decodeURIComponent(item[1]);
        });
    }
    return result;
}

function cookieStringToObject(str) {
    str = str.split('; ');
    var result = {};
    for (var i = 0; i < str.length; i++) {
        var cur = str[i].split('=');
        result[cur[0]] = cur[1];
    }
    return result;
}

function resetTable() {
    var table = document.querySelectorAll('.table')[0];
    var rows = document.querySelectorAll('.category');
    for(var i = 0; i < rows.length; i++) {
        table.removeChild(rows[i]);
    }
}

function extractQuote(str) {
    if ( /'/.test( str ) ){
      return str.match( /'(.*?)'/ )[1];
    } else {
        return str;
    }
}

function makeTd(content) {
    var newTd = document.createElement('td');
    newTd.textContent = content;
    return newTd;
}

function makeTr() {
    var newTr = document.createElement('tr');
    newTr.className = 'data';
    return newTr;
}

function consolidateObjects() {
    var consolidated = {};
    var numberOfObjects = arguments.length;
    for (var i = 0; i < numberOfObjects; i++) {
        var obj = arguments[i];
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if(!(key in consolidated)) {
                    consolidated[key] = new Array(numberOfObjects);
                }
                consolidated[key][i] = obj[key]
            }
        }
    }
    return consolidated;
}

function splitCommand(command) {
    var reg = / -H /g;
    var myArray;
    var fragments = [];
    var lastIndex = 5;
    while(myArray !== null) {
        myArray = reg.exec(command);
        if(myArray) {
            fragments.push(extractQuote(command.substring(lastIndex, myArray.index)));
            lastIndex = myArray.index + 4;
        } else {
            fragments.push(extractQuote(command.substring(lastIndex)));
        }
    }
    return fragments;
}

function convertToObject(inputArray) {
    var obj = {};
    for (var i = 0; i < inputArray.length; i++) {
        if(i === 0) {
            obj.Url = inputArray[0];
        } else {
            var pair = inputArray[i].split(': ');
            if (pair.length > 1) {
                obj[pair[0]] = pair[1];
            }
        }
    }
    return obj;
}

function extractQuery(input) {
    var idx = input.indexOf('?');
    var str = input.slice(idx > -1 ? idx : 0);
    var vars = str.split("&");
    var pairs = [];
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        pairs.push(pair);
    }
    return pairs;
}

function errorMessage(text) {
    resetError();
    error = true;
    var errorDom = document.createElement('div');
    errorDom.className = 'error';
    errorDom.textContent = text;
    document.body.appendChild(errorDom);
}

function resetError() {
    error = false;
    var errorDoms = document.querySelectorAll('.error');
    errorDoms.forEach(function(errorDom) {
        document.body.removeChild(errorDom);
    });
}