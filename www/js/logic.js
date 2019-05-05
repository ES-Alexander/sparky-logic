window.onload = function() {
    /* Input values and instances */
    var inputVars, func; // input variables, logic function
    var funcInput = document.querySelector("#function"); // function input object
    var inputList = document.querySelector("#inputList"); // input list object
    var convertButton = document.querySelector("#convert"); // convert command button

    /* Output values and instances */
    var outputTable = document.querySelector("#funcOutput");

    /* Helper values and instances */
    // list of viable operators for the logic function
    var operators = ['.', '&', '+', '|', '!', '~']; 
    // list of allowed delimiter characters for the logic function
    var delimiters = ['(', ')'];
    // combined to form the viable list of characters for the logic function (-inputs)
    var acceptableSymbols = [];
    acceptableSymbols = acceptableSymbols.concat(operators);
    acceptableSymbols = acceptableSymbols.concat(delimiters);
    var deconArray = [0, null]; 
        // index 0: 0 when undeconstructed, 1 when deconstructed.
        // index 1: deconstructed function.

    /* Listeners */
    // On button click:
    convertButton.addEventListener('click', function(evt) {
            // update function to inputted string
            func = removeSpaces(funcInput.value);
            // record variables as inputted variable list
            inputVars = removeSpaces(inputList.value).split(",");
            // create table for output based on inputted function and variables
            createOutputTable(func, outputTable, inputVars, acceptableSymbols, deconArray);
            // set function 'deconstructed' property to false
            deconArray[0] = 0;
        }, false);
};


/* Creates the truth table based on the function and specified input variables.*/
function createOutputTable(func, outputTable, inputVars, baseacceptableSymbols, deconArray) {
    // sets acceptable function input characters to include operators, delimiters, and inputs.
    var acceptableSymbols = [];
    acceptableSymbols = acceptableSymbols.concat(baseacceptableSymbols);
    acceptableSymbols = acceptableSymbols.concat(inputVars);

    // checks if function is a valid function string depending on acceptable characters (above)
    if(validateFunc(func, acceptableSymbols, outputTable) && validateInputs(func, inputVars, outputTable)) {
        // initialise string for table headers input. 
        // Table DOESN'T WORK if created using multiple strings!
        var tHeadString = "<table> <thead style='border-bottom:2px solid;'> <tr>";
        // initialise variables as output table headings
        for(var varIndex=0; varIndex < inputVars.length; varIndex++) {
            tHeadString += (" <th>" + inputVars[varIndex] + "</th>");
        }
        // add output column, end heading row.
        tHeadString += (" <th style='border-left:2px solid;'>X</th> </tr> </thead>");       

        // initialise an empty dictionary of inputs:values
        var inputDict = [inputVars, []];
        // populate dictionary with provided inputs
        for(var i=0; i<inputVars.length; i++) {
            inputDict[1][i] = 0;
        }

        // initialise string for table body/data input.
        var tBodyString = "";
        for(var index=0; index < inputVars.length*Math.pow(2,inputVars.length); index++) {
            // Determine current input value
            var inputVal = binaryInput(index, inputVars.length);
            // Add current input value to dictionary of inputs:values
            inputDict[1][index % inputVars.length] = inputVal;
            // output row of inputs to console once row created
            if((index % inputVars.length) == (inputVars.length - 1)) { 
                console.log(inputDict);
            }

            if((index % inputVars.length) === 0) { // New row
                tBodyString += "<tr> <td>" + inputVal + "</td> ";
            } else if((index % inputVars.length) == (inputVars.length - 1)) { // End of row
                console.log("Output called for.");
                var outputVal = funcOutput(func, inputDict, baseacceptableSymbols, deconArray);
                tBodyString += " <td>" + inputVal + "</td> <td style='border-left:2px solid;'> " + outputVal + "</td> </tr>";
            } else { // Standard data point
                tBodyString += " <td>" + inputVal + "</td>";
            }
        }
        outputTable.innerHTML = tHeadString + tBodyString + " </table>";
    }
}

/* Calculates the binary input value for the output table, 
        given the current index and number of inputs.*/
function binaryInput(index, nInputs) {
    var bin = (Math.floor(index/nInputs)).toString(2);
    var binExtend = zString(nInputs - bin.length) + bin;
    return parseInt(binExtend.charAt((index % nInputs)));
}

/* Calculates the output value based on the given function and inputs.*/
function funcOutput(func, inputDict, baseacceptableSymbols, deconArray) {
    if(deconArray[0] === 0) {
        //deconArray[1] = funcDeconstruct(func, inputDict, baseacceptableSymbols);
        deconArray[0] = 1;
    }
    console.log("Input dict: " + inputDict.A);
    console.log("decon Func: " + deconArray[1](inputDict));
    //return deconArray[1](inputDict);
    return 0;
}

/* Deconstructs the function string and returns a usable logic function. */
// INCREASE EFFICIENCY BY CHANGING TO REAL DICT, NOT ARRAYS
function funcDeconstruct(func, inputDict, baseacceptableSymbols) {
    // Validity variable.
    var validity = "";
    // deals with bracket groupings inside function string
    if(func.includes("(")) {
        // initialises bracket storage arrays
        var openBrackets = [];
        var closeBrackets = [];
        var brackets = [openBrackets, closeBrackets];
        var openIndex=0;
        var closeIndex=0;
        var counter=0;
        while(counter < Math.max(func.replace(/[^(]/g, "").length, func.replace(/[^)]/g, "").length)) {
            openBrackets[counter] = func.indexOf("(",openIndex);
            closeBrackets[counter] = func.indexOf(")",closeIndex);
            if(openBrackets[counter]<0) {openBrackets[counter] = null;}
            if(closeBrackets[counter]<0) {closeBrackets[counter] = null;}
            openIndex = openBrackets[counter] + 1;
            closeIndex = closeBrackets[counter] + 1;
            counter++;
        }
        // check if all brackets are paired.
        if(func.replace(/[^(]/g, "").length != func.replace(/[^)]/g, "").length) {
            validity += "invalidBracketPair ";
            invalidArrayMatch("Number of open and close brackets do not match.");
        }
        // check if first bracket is opened.
        if(func.indexOf(")")<func.indexOf("(")) {
            validity += "invalidInitialBracket ";
            invalidArrayMatch("First bracket cannot be a closing brace.");
        }
        // check if last bracket is closed.
        if(func.lastIndexOf("(")>func.lastIndexOf(")")) {
            validity += "invalidFinalBracket ";
            invalidArrayMatch("Last bracket cannot be open.");
        }
        if(validity.match("")) {
            // order brackets into respective grouped pairs.
            var orderedOpenBrackets = [];
            var orderedCloseBrackets = [];
            var bracketGroups = [orderedOpenBrackets,orderedCloseBrackets];
            var i=0;
            // while unordered open brackets exist
            while(i<(openBrackets.length)) {
                // add first unordered open bracket to ordered list 
                //      (and remove from unordered list)
                orderedOpenBrackets.push(parseInt(openBrackets.splice(i,1)));
                var j=0;
                // while this close bracket comes after the next open bracket,
                //      and the next open bracket is greater than the last close bracket
                while(closeBrackets[j]>openBrackets[i]) {
                    // skip this close bracket and the next open bracket
                    j++;
                    i++;
                }
                // add correct close bracket to ordered close bracket list
                //      (and remove from unordered list)
                orderedCloseBrackets.push(parseInt(closeBrackets.splice(j,1)));
                // reset open bracket counter
                i=0;
            }
            i=0;
            // Reduce ordered lists to only largest mutually exclusive sets of brackets
            while(i<orderedOpenBrackets.length) {
                for(j=0; j<i; j++) {
                    if(orderedOpenBrackets[i]<orderedCloseBrackets[j]) {
                        orderedOpenBrackets.splice(i,1);
                        orderedCloseBrackets.splice(i,1);
                        i--;
                    }
                }
                i++;
            }            
            if(orderedOpenBrackets[0] != 0) {
                var initial = func.slice(0,orderedOpenBrackets[0]);
                if(initial.length === 1 && (initial.match("!") || initial.match("~"))) {
                    //negate(func.slice(bracketGroups[0][0]+1,bracketGroups[1][0]));
                }
            }
        }
    } // elseif for doesn't contain brackets

    // SPLIT BY BRACKETS, THEN ORS, THEN ANDS, THEN NOTS
    // MAKE FUNCTION ARRAY FOR ORS, ANDS, AND NOTS
    return function(inputs) {
        var result = "";
        var innerOuter = 0;
        var index = 0;
        /* variable for storing whether or not the last string addition
            was a function */
        var funcLast = false; 
        var currentBlock = "";
        while(innerOuter < (2*orderedOpenBrackets.length + 1)) {
            // if inside a set of brackets:
            if(innerOuter%2 === 1) {
                currentBlock += "funcDeconstruct(func.slice(index, \
                                    orderedCloseBrackets[innerOuter/2]), \
                                inputDict, baseacceptableSymbols)";
                if(funcLast) {
                    currentBlock += ")";
                    funcLast = false;
                }
                index = orderedCloseBrackets[innerOuter/2] + 1;
            }
            // if outside a set of brackets:
            else {
                var funcPortion = func.slice(index,orderedOpenBrackets[innerOuter/2]);
                if(funcPortion.length <= 1) {
                    if(funcPortion === "!" || funcPortion === "~") {
                        currentBlock += "negate(";
                        funcLast = true;
                    } else if(funcPortion === "+" || funcPortion === "|") {
                        result += currentBlock;
                        currentBlock = "logicOr(";
                        funcLast = true;
                    } else if(funcPortion === "&" || funcPortion === "." ||
                              (funcPortion === "" && innerOuter < 
                                    2*orderedOpenBrackets.length)) {
                        currentBlock += "logicAnd(";
                        funcLast = true;
                    } else if(funcPortion in inputs[0]) {
                        currentBlock = "logicAnd([" + 
                            inputs[1][inputs[0].indexOf(funcPortion)] + currentBlock;
                    }
                }
                index = orderedOpenBrackets[innerOuter/2] + 1;
            }
        }

        console.log("Answer func: " + inputs[1]);
        for(var i=0; i<inputs[0].length; i++) {
            console.log(inputs[1][i]);
        }
        return eval(result); // make this return something to do with input values.
    };
}

/* Negates/inverts the inputted bit (0->1, 1->0) */
function negate(binaryBit) {
    if(binaryBit === 0) {
        return 1;
    }
    else if(binaryBit === 1) {
        return 0;
    }
}

/* "AND"s the inputted bits */
function logicAnd(binaryBits) {
    for(bit in binaryBits) {
        if(bit === 0) {
            return 0;
        }
    }
    return 1;
}

/* "OR"s the inputted bits */
function logicOr(binaryBits) {
    for(bit in binaryBits) {
        if(bit === 1) {
            return 1;
        }
    }
    return 0;
}

/* Returns the entered string without spaces.*/
function removeSpaces(funcString) {
    var funcStringList = funcString.split(" ");
    return funcStringList.join("");
}

/* Creates a string of zeros, of length 'num'.*/
function zString(num) {
    var str = "";
    for(var i=0;i<num;i++) {
        str += "0";
    }
    return str;
}

// VALIDATION FUNCTIONS
/* Validation of function against inputs, operators, and delimiters.*/
function validateFunc(funcString, acceptableSymbols, output) {
    for(var i=0; i<funcString.length; i++) {
        if(!validateChar(funcString.charAt(i), acceptableSymbols)) {
            invalidCharError(funcString.charAt(i), output);
            return false;
        }
    }
    console.log("Function Valid.");
    return true;
}

/* Checks if the specified char is in the given list of acceptable chars.*/
function validateChar(char, acceptableSymbols) {
    if(acceptableSymbols.indexOf(char) != -1) {return true;}
    else {return false;}
}

/* Checks if all specified inputs are used in the function.*/
function validateInputs(funcString, inputVars, output) {
    for(var i=0; i<inputVars.length; i++) {
        if(funcString.indexOf(inputVars[i]) == -1) {
            invalidInputError(inputVars[i], output);
            return false;
        }
    }
    console.log("Inputs Valid.");
    return true;
}

// ERROR FUNCTIONS
/*Displays an "invalid character" error in the given output element.*/
function invalidCharError(char, output) {
    output.innerHTML = "Character: '" + char + "' invalid.";
}

/*Displays an "invalid input" error in the given output element.*/
function invalidInputError(variable, output) {
    output.innerHTML = "Variable: '" + variable + "' not found in function.";
}

function invalidArrayMatch(str) {
    console.log(str);
}