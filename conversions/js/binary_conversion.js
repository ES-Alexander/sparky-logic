window.onload = function() {
    // Input values and instances
    var value, type, nBits, base;
    var valueInput = document.querySelector("#value");
    var typeInput = document.querySelector("#valType");
    var nBitsInput = document.querySelector("#nBits");
    var nBitsLabel = document.querySelector("#nBitsLabel");
    var convertButton = document.querySelector("#convert");
    
    // Output values and instances
    var nXS;
    var decOutput = document.querySelector("#decOutput");
    var binUOutput = document.querySelector("#binUOutput");
    var binSMOutput = document.querySelector("#binSMOutput");
    var binOCOutput = document.querySelector("#binOCOutput");
    var binTCOutput = document.querySelector("#binTCOutput");
    var binXSOutput = document.querySelector("#binXSOutput");
    var nXSval = document.querySelector("#nXSval");
    var hexOutput = document.querySelector("#hexOutput");
    var octOutput = document.querySelector("#octOutput");
    
    var dec = document.querySelector("#dec");
    var binU = document.querySelector("#binU");
    var binSM = document.querySelector("#binSM");
    var binOC = document.querySelector("#binOC");
    var binTC = document.querySelector("#binTC");
    var binXS = document.querySelector("#binXS");
    var hex = document.querySelector("#hex");
    var oct = document.querySelector("#oct");
    
    var outputDict = {
        "Dec": [decOutput, dec, 0],
        "BinU": [binUOutput, binU, 0],
        "BinSM": [binSMOutput, binSM, 0],
        "BinOC": [binOCOutput, binOC, 0],
        "BinTC": [binTCOutput, binTC, 0],
        "BinXS": [binXSOutput, binXS, 0],
        "Hex": [hexOutput, hex, 0],
        "Oct": [octOutput, oct, 0]
    };
    
    // Listeners
    valueInput.addEventListener('change', function(evt) {
        value = valueInput.value;
        console.log("value: " + value);
    }, false);
    typeInput.addEventListener('change', function(evt) {
        type = typeInput.value;
        console.log("type: " + type);
        for(var output in outputDict) {
            if(!output.match(type)) {
                outputDict[output][0].style.display = "block";
            }
            else {
                outputDict[type][0].style.display = "none";
                outputDict[type][2] = value;
            }
        }
    }, false);
    nBitsInput.addEventListener('change', function(evt) {
        nBits = nBitsInput.value;
        nXS = Math.pow(2,nBits-1);
        nXSval.innerHTML = nXS;
    }, false);
    
    convertButton.addEventListener('click', function(evt) {
        outputDict[type][2] = value;
        calculateAndUpdateValues(outputDict, type, nBits);
    }, false);
    
}

function calculateAndUpdateValues(outputDict, inputVal, nBits) {
    console.log("CONVERSION IN PROGRESS");
    var dec = 0;
    if(inputVal.match("Dec")) {
       dec = Number(outputDict["Dec"][2]);
    } else if(inputVal.match("BinU")) {
        dec = parseInt(outputDict["BinU"][2],2);
    } else if(inputVal.match("Hex")) {
        dec = parseInt(outputDict["Hex"][2],16);
    } else if(inputVal.match("Oct")) {
        dec = parseInt(outputDict["Oct"][2],8);
    } else if(inputVal.match("BinSM")) {
        dec = parseInt(outputDict["BinSM"][2].slice(1),2);
        if(outputDict["BinSM"][2][0].match("1")) {dec *= -1;}
    } else if(inputVal.match("BinOC")) {
        if(outputDict["BinOC"][2][0].match("1")) {
            var binOCN = "";
            for(var i=0; i<outputDict["BinOC"][2].length; i++) {
                if(outputDict["BinOC"][2][i].match("0")) {
                    binOCN += "1";
                } else {
                    binOCN += "0";
                }
            }
            dec = -1*parseInt(binOCN, 2);
        } else {
            dec = parseInt(outputDict["BinOC"][2], 2);
        }
    } else if(inputVal.match("BinTC")) {
        if(outputDict["BinTC"][2][0].match("1")) {
            var binTCN = "";
            for(var i=0; i<outputDict["BinOC"][2].length; i++) {
                if(outputDict["BinOC"][2][i].match("0")) {
                    binTCN += "1";
                } else {
                    binTCN += "0";
                }
            }
            dec = -1*parseInt(binTCN, 2);
        } else {
            dec = parseInt(outputDict["BinTC"][2], 2);
        }
    }
    
    outputDict["Dec"][1].innerHTML = dec;
    

    // Determine binary (excess-n) value and add to the screen
    outputDict["BinXS"][2] = numToBit(dec + Math.pow(2,nBits-1));
    console.log(outputDict["BinXS"][2]);
    outputDict["BinXS"][1].innerHTML = zString(nBits - outputDict["BinXS"][2].length) +
        outputDict["BinXS"][2];

    // if value is negative, ignore unsigned binary 
    if(dec >= 0) {
        console.log("positive");
        var binList = ["BinU","BinSM","BinOC","BinTC","BinXS"];
        // Determine binary (unsigned) value and add to screen
        for(var i in binList) {
            outputDict[binList[i]][2] = numToBit(dec);
        }
        // Determine Hex and Oct values
        outputDict["Hex"][2] = dec.toString(16).toUpperCase();
        console.log(outputDict["Hex"][2]);
        if(nBits < outputDict["Hex"][2].length) {
            overflowError(outputDict["Hex"][1]);
        } else {
            outputDict["Hex"][1].innerHTML = zString(nBits - outputDict["Hex"][2].length) +
                outputDict["Hex"][2];
        }

        outputDict["Oct"][2] = dec.toString(8);
        if(nBits < outputDict["Oct"][2].length) {
            overflowError(outputDict["Oct"][1]);
        } else {
            outputDict["Oct"][1].innerHTML = zString(nBits - outputDict["Oct"][2].length) +
                outputDict["Oct"][2];
        }

        // if number overflows in unsigned binary, print overflow error in all binary.
        if(nBits < outputDict["BinU"][2].length) {
            for(var i=0; i < binList.length; i++) {
                overflowError(outputDict[binList[i]][1]);
            }
        } else {
            // if number overflows in signed, ones' comp, and excess-m, print overflow error.
            if(nBits == outputDict["BinU"][2].length) {
                binList2 = ["BinSM","BinOC","BinTC","BinXS"];
                for(var i=0; i < binList2.length; i++) {
                    overflowError(outputDict[binList2[i]][1]);
                }
                // and print unsigned value
                outputDict["BinU"][1].innerHTML = 
                        zString(nBits - outputDict["BinU"][2].length) + 
                        outputDict["BinU"][2];
            } else {
                // print values for unsigned, signed, 
            for(var i=0; i<(binList.length - 1); i++) {
                    outputDict[binList[i]][1].innerHTML = 
                        zString(nBits - outputDict[binList[i]][2].length) + 
                        outputDict[binList[i]][2];
            }
            }
        }
    } else if(dec<0) {
        console.log("negative");
        outputDict["BinU"][2] = numToBit((-1)*dec);
        var nonNegatives = ["BinU", "Hex", "Oct"];
        for(var i=0; i<nonNegatives.length; i++) {
            outputDict[nonNegatives[i]][1].innerHTML = "N/A - Negative Value";
        }

        outputDict["BinSM"][1].innerHTML = "1" + 
            zString(nBits-(outputDict["BinU"][2].length+1)) + 
            outputDict["BinU"][2];

        outputDict["BinOC"][2] = oneString(nBits-outputDict["BinU"][2].length);
        for(var i=0; i < outputDict["BinU"][2].length; i++) {
            if(outputDict["BinU"][2][i].match("0")) {
                outputDict["BinOC"][2] += "1";
            } else {
                outputDict["BinOC"][2] += "0";
            }
        }
        outputDict["BinOC"][1].innerHTML = outputDict["BinOC"][2];

        var leadingVal;
        console.log(outputDict["BinXS"][1].textContent);
        if(outputDict["BinXS"][1].textContent[0].match("0")) {
            leadingVal = "1";
        } else {
            leadingVal = "0";
        }
        outputDict["BinTC"][1].innerHTML = leadingVal + 
            outputDict["BinXS"][1].innerHTML.slice(1);
        
        binList3 = ["BinSM","BinOC","BinXS"];
        console.log(outputDict["BinSM"][1].textContent.length);
        if(outputDict["BinSM"][1].textContent.length > nBits) {
            for(var i=0; i<binList3.length; i++) {
                overflowError(outputDict[binList3[i]][1]);
            }
        }
        if(dec < -1*Math.pow(2,nBits-1)) {
            overflowError(outputDict["BinTC"][1]);
        }
    } else {
        for(var element in outputDict) {
            outputDict[element][1].innerHTML = "Invalid Input";
        }
    }
}

function numToBit(num){
    var number = num;
    var result = [];
    while(number >= 1 ){
        result.unshift(Math.floor(number%2));
        number = number/2;
    }
    return array2String(result);
}

function array2String(array) {
    var str = "";
    for(var index in array) {
        str += array[index];
    }
    return str;
}

function zString(num) {
    var str = "";
    for(var i=0;i<num;i++) {
        str += "0";
    }
    return str;
}

function oneString(num) {
    var str = "";
    for(var i=0;i<num;i++) {
        str += "1";
    }
    return str;
}

function overflowError(element) {
    element.innerHTML = "OVERFLOW - Value not possible to display in given number of bits.";
}