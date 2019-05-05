// GLOBAL VARIABLES

// valid operators for the logic function
var OPERATORS = ['.', '&', '+', '|', '!', '~', '^'];
// allowed delimiter characters for the logic function
var DELIMITERS = ['(', ')'];

/*
 * Function to run on page open
 */
window.onload = function() {
    /* Input values and instances */
    // input variables, logic function, equivalent functions
    var inputVars, func, equivalencyFuncs; 
    // TABS
    // conversion tab
    var conversionTab = document.querySelector("#conversion");
    // equivalency tab
    var equivalencyTab = document.querySelector("#equivalency");
    // TAB FEATURES
    var conversionElements = document.querySelectorAll(".conversion");
    var equivalencyElements = document.querySelectorAll(".equivalency");
    var functionLabel = document.querySelector("#function-label");
    var heading = document.querySelector("#heading");
    // function input object
    var funcInput = document.querySelector("#function"); 
    // input list object
    var inputList = document.querySelector("#inputList"); 
    // equivalency text area
    var textArea = document.querySelector("#working");
    // convert command button
    var convertButton = document.querySelector("#convert"); 
    // check equivalency command button
    var checkEquivalencyButton = document.querySelector("#check-equivalency");
    

    /* Output values and instances */
    var outputTable = document.querySelector("#funcOutput");

    /* Helper values and instances */
    // combined to form the allowed list of characters for the logic function
    var validSymbols = [].concat(OPERATORS, DELIMITERS);
    
    /* Listeners */
    // On button click:
    convertButton.addEventListener('click', 
        function(evt) {
            // set function as inputted string
            func = removeSpaces(funcInput.value);
            // set variables as inputted variable list
            inputVars = removeSpaces(inputList.value).split(",");
            // create output table, based on inputted function and variables
            createOutputTable(func, outputTable, inputVars, validSymbols);
            // add sum of products representation below table
            addSumOfProducts(outputTable, inputVars);
            // add reduced some of products
            addReducedSumOfProducts(outputTable, func, inputVars);
        }, false);
    
    checkEquivalencyButton.addEventListener('click', 
        function(evt) {
            // set initial function as inputted string
            func = removeSpaces(funcInput.value);
            // set variables as inputted variable list
            inputVars = removeSpaces(inputList.value).split(",");
            // read in equivalency values
            equivalencyFuncs = removeSpaces(textArea.value).split("\n");
            // create equivalency output table
            createEquivalencyOutput(func, outputTable, inputVars, validSymbols,
                                   equivalencyFuncs);
        }, false);
    
    // Add in tab listeners
    addTabListeners(conversionTab, conversionElements, equivalencyTab, 
                 equivalencyElements, functionLabel, heading);
};

/*
 * Creates the truth table for the given function, with the specified inputs.
 */
function createOutputTable(func, outputTable, inputVars, validSymbols) {
    // add the input variables to the valid symbols
    validSymbols.concat(inputVars);
    // check if the function is valid, provide useful error message if not.
    var validity = isValid(func, validSymbols, inputVars);
    if(validity[0]) {
        // log validity in console
        console.log("Function Valid");
        // backup for if it fails
        outputTable.innerHTML = 
            "<p style='color: #F77'>Function deconstruction has failed due " +
            "to an unknown cause. My sincere apologies.<p>";
        // generate string with table headers 
        // Table DOESN'T WORK if created using multiple strings!
        var tHeadString = genHeadString(inputVars);
        // generate string form of the body of the table
        var tBodyString = genBodyString(func, inputVars, validSymbols);
        // complete the table and add to the page
        outputTable.innerHTML = tHeadString + tBodyString + " </table>";
    } else {
        // log validity in console
        console.log("Function Invalid");
        // update output with relevant error message(s)
        outputTable.innerHTML = '<p style="color: #F77"> Logic Function: ' +
            func + "<br> Inputs: " + inputVars + 
            '<br> &emsp;Conversion failed:' + validity[1] + "</p>";
    }
}

/*
 * Creates the equivalency table for the given function and working lines.
 */
function createEquivalencyOutput(func, outputTable, inputVars, validSymbols,
                                 equivalencyFuncs) {
    // add the input variables to the valid symbols
    validSymbols.concat(inputVars);
    // check if the function is valid, provide useful error message if not.
    var validity = isValid(func, validSymbols, inputVars);
    if(validity[0]) {
        // log validity in console
        console.log("Function Valid");
        // backup for if it fails
        outputTable.innerHTML = 
            "<p style='color: #F77'>Initial function deconstruction has " +
            "failed due to an unknown cause. My sincere apologies.<p>";
        // generate string with table headers 
        // Table DOESN'T WORK if created using multiple strings!
        var tHeadString = "<h3>Equivalency Results</h3> <table> " + 
            "<thead style='border-bottom:2px solid;'> " +
            "<tr> <th>Function</th> <th style='border-left:2px solid;'>" +
            "Equivalency</th> </tr> </thead>";
        // generate string form of the body of the table
        var tBodyString = genEquivalencyBodyString(func, inputVars, 
                                validSymbols, equivalencyFuncs);
        // complete the table and add to the page
        outputTable.innerHTML = tHeadString + tBodyString + " </table>";
    } else {
        // log validity in console
        console.log("Function Invalid");
        // update output with relevant error message(s)
        outputTable.innerHTML = '<p style="color: #F77"> Logic Function: ' +
            func + "<br> Inputs: " + inputVars + 
            '<br> &emsp;Conversion failed:' + validity[1] + "</p>";
    }
}


// VALIDITY DETERMINATION FUNCTIONS

/*
 * Determines if the given function contains only valid symbols, and all inputs
 * are used.
 */
function isValid(func, validSymbols, inputVars) {
    // initialise the return array
    var returnArray = [true, ""];
    // separate the function into individual characters
    var funcChars = func.split("");
    
    // check validity
    var symbolsV = symbolValidity(funcChars, validSymbols, inputVars);
    var bracketsV = bracketValidity(func);
    var inputsV = inputValidity(funcChars, validSymbols, inputVars);
    
    // update return array with relevant aspects of checks
    returnArray[0] &= symbolsV[0] && bracketsV[0] && inputsV[0];
    returnArray[1] += symbolsV[1] + bracketsV[1] + inputsV[1];
    
    return returnArray;
}

/*
 * Checks if the function's symbol usage is valid.
 */
function symbolValidity(funcChars, validSymbols, inputVars) {
    // initialise the return array
    var returnArray = [true, ""];
    // initialise array of invalid symbols (to avoid repeated errors)
    var invalidSymbols = [];
    // iterate over the characters and check validity
    for(var charIndex in funcChars) {
        var index = parseInt(charIndex);
        var char = funcChars[index];
        if(!listContains(validSymbols, char) &&
           !listContains(inputVars, char) && 
           !listContains(invalidSymbols, char)) {
            invalidSymbols += char;
            var msg = "Invalid symbol: " + char;
            inputError(returnArray, msg);
        } else if(listContains(OPERATORS, char)) {
            // if symbol is an operator
            var preceding = funcChars[index - 1];
            // it can't be preceded by another operator, or an open brace,
            // unless the symbol is a negation
            if((typeof preceding == 'undefined' ||
               listContains(OPERATORS + "(", preceding)) && 
                !"!~".includes(char)) {
                var msg = 'Operators can only be preceded by inputs or close ' +
                    'braces (issue with: "' + char + '", at index: ' + 
                    index + ')';
                inputError(returnArray, msg);
            }
            var proceeding = funcChars[index + 1];
            // it also can't be proceeded by an operator or closed brace
            if(typeof proceeding == 'undefined' || 
               listContains(OPERATORS.filter(function(element) {
                return !"!~".includes(element);}) + ")", proceeding)) {
                var msg = 'Operators can only be proceeded by inputs or open ' +
                    'braces (issue with: "' + char + '", at index: ' + 
                    index + ')';
                inputError(returnArray, msg);
            }
        }
    }
    
    return returnArray;
}

/*
 * Checks if bracket numbering and placements are valid.
 */
function bracketValidity(func) {
    // initialise the return array
    var returnArray = [true, ""];
    // check if all brackets are paired.
    if(func.replace(/[^(]/g, "").length != func.replace(/[^)]/g, "").length) {
        var msg = 'Number of open brackets "(" does not match number of ' +
            'closing brackets ")"';
        inputError(returnArray, msg);
    }
    // check if first bracket is opened.
    if(func.includes(")") && func.indexOf(")")<func.indexOf("(")) {
        var msg = 'First bracket cannot be a closing brace ")"';
        inputError(returnArray, msg);
    }
    // check if last bracket is closed.
    if(func.lastIndexOf("(")>func.lastIndexOf(")")) {
        var msg = 'Last bracket cannot be open "("';
        inputError(returnArray, msg);
    }
    // check for empty pairs of brackets
    if(func.includes("()")) {
        var msg = "Bracket pairs cannot be empty";
        inputError(returnArray, msg);
    }
    // check bracket predecession numbers
    for(var index in func) {
        var shorter = func.substring(0,parseInt(index));
        var openBrackets = shorter.replace(/[^(]/g, "").length;
        var closedBrackets = shorter.replace(/[^)]/g, "").length;
        if(openBrackets < closedBrackets) {
            var msg = 'Number of close brackets ")" cannot exceed number of ' +
                'preceding open brackets "("';
            inputError(returnArray, msg);
            break;
        }
    }
    
    return returnArray;
}

/*
 * Checks if inputs are correct, and all inputs are used.
 */
function inputValidity(funcChars, validSymbols, inputVars) {
    // initialise the return array
    var returnArray = [true, ""];
    // iterate over the input variables to check they're all used
    for(var inputIndex in inputVars) {
        // Input not used
        /* Error redundant
        if(!listContains(funcChars, inputVars[inputIndex])) {
            var msg = "Input not used: " + inputVars[inputIndex];
            inputError(returnArray, msg);
        } */
        // initialise an array of additional invalid input characters
        var invalidExtras = [",", ""];
        if(listContains(validSymbols, inputVars[inputIndex])) {
            var msg = "Invalid input: " + inputVars[inputIndex];
            inputError(returnArray, msg);
        } else if(listContains(invalidExtras, inputVars[inputIndex])) {
            var msg = 'Invalid input: comma (,) or empty string ("")';
            inputError(returnArray, msg);
        } else if(inputVars[inputIndex].length !== 1) {
            var msg = "Invalid input: " + inputVars[inputIndex] + 
                " (inputs are restricted to 1 character in length)";
            inputError(returnArray, msg);
        }
        // check for duplicates
        if(inputVars.indexOf(inputVars[inputIndex]) != inputIndex) {
            var msg = "Invalid input: " + inputVars[inputIndex] + 
                " (duplicate inputs are not allowed)";
            inputError(returnArray, msg);
        }
        // check for binary input names (derp)
        if(inputVars[inputIndex] === "1" || inputVars[inputIndex] === "0") {
            var msg = "Invalid input: " + inputVars[inputIndex] +
                " (binary input variable names not allowed)";
            inputError(returnArray, msg);
        }
    }
    
    return returnArray;
}


// OUTPUT DETERMINATION FUNCTIONS

/*
 * Generate the string for the head of the output table.
 */
function genHeadString(inputVars) {
    // initialise string for table headers input. 
    var tHeadString = "<h3> Truth Table </h3>" + 
        "<table> <thead style='border-bottom:2px solid;'> <tr>";
    // initialise variables as output table headings
    for(var varIndex in inputVars) {
        tHeadString += (" <th>" + inputVars[parseInt(varIndex)] + "</th>");
    }
    // add output column, end heading row.
    tHeadString += (" <th style='border-left:2px solid;'>X</th> </tr> </thead>");       
    return tHeadString;
}


/*
 * Generate the string for the body of the output table.
 */
function genBodyString(func, inputVars, validSymbols) {
    // deconstruct the input function into usable form
    var deconstructedFunc = deconstructFunc(func, inputVars, validSymbols);
    
    // initialise an empty dictionary of inputs:values
    var inputDict = {};
    // populate dictionary with provided inputs
    for(var i=0; i<inputVars.length; i++) {
        inputDict[inputVars[i]] = 0;
    }

    var nInputs = inputVars.length;
    // initialise string for table body/data input.
    var tBodyString = "";
    for(var index=0; index < nInputs*Math.pow(2,nInputs); index++) {
        // Determine current input value
        var inputVal = binaryInput(index, nInputs);
        // Add current input value to dictionary of inputs:values
        inputDict[inputVars[index % nInputs]] = inputVal;
        // output row of inputs to console once row created
        if((index % nInputs) == (nInputs - 1)) { 
            console.log(inputDict);
        }

        if((index % nInputs) == (nInputs - 1)) { // End of row
            console.log("Output called for.");
            var outputVal = deconstructedFunc(inputDict);
            tBodyString += " <td>" + inputVal + 
                "</td> <td style='border-left:2px solid;'>" + outputVal +
                "</td> </tr>";
        } else if((index % nInputs) === 0) { // New row
            tBodyString += "<tr> <td>" + inputVal + "</td> ";
        } else { // Standard data point
            tBodyString += " <td>" + inputVal + "</td>";
        }
    }
    return tBodyString;
}

/*
 * Generates the string for the body of the equivalency output (including 
 * tooptips).
 */
function genEquivalencyBodyString(func, inputVars, validSymbols,
                                  equivalencyFuncs) {
    var tBodyString = "";
    for(var index=0; index<equivalencyFuncs.length; index++) {
        var func2 = equivalencyFuncs[index];
        if(!equivalencyFuncs.slice(0,index).includes(func2) &&
           !(func2 == "")) {
            tBodyString += " <tr> <td style='border-right:2px solid;'>" + func2 +
                "</td> <td style='text-align:center; color:";
            var validityArray = isValid(func2, validSymbols, inputVars);
            if(validityArray[0]) {
                var compareArray = funcCompare(func, func2, validSymbols, 
                                               inputVars);
                if(compareArray[0]) {
                    tBodyString += "green'>&#10004;</td>";
                } else {
                    tBodyString += "#F77' class='tooltip'>&#10008; " +
                        "<span class='tooltiptext'>" + compareArray[1] +
                        "</span> </td>";
                }
                tBodyString += " </tr>";
            } else {
                tBodyString += "#F77' class='tooltip'>&#10008; " +
                        "<span class='tooltiptext'>" + validityArray[1] +
                        "</span> </td> </tr>";
            }
        }
    }
    return tBodyString;
}


// INPUT FUNCTION DECONSTRUCTION FUNCTIONS

/*
 * Deconstructs the string function into usable form.
 */
function deconstructFunc(func, inputVars) {
    // initialise return function as copy of original (to modify)
    var returnFunc = func.slice(0);
    // initialise starting index
    var index = 0;
    // log progress in console
    console.log("Deconstructing: " + returnFunc);
    // replace equivalent operators
    returnFunc = returnFunc.replace(/\./g, '&');
    returnFunc = returnFunc.replace(/\+/g, '|');
    returnFunc = returnFunc.replace(/~/g, '!');
    // add in additional AND operators as required
    while(index < returnFunc.length) {
        var current = returnFunc.charAt(index++);
        var proceeding = returnFunc.charAt(index);
        // current is input variable or close bracket, followed by open bracket
        // current is close bracket, followed by input variable
        // current is input variable, followed by additional input variable or 
        //     negation
        if(((listContains(inputVars, current) || current === ')') && 
           proceeding === '(') || (current === ")" && 
           listContains(inputVars, proceeding)) || 
           (listContains(inputVars, current) && 
            (listContains(inputVars, proceeding) || proceeding === "!"))) {
            returnFunc = returnFunc.slice(0, index) + "&" + 
                returnFunc.slice(index);
        }
        console.log(returnFunc);
    }
    returnFunc = "1&(" + returnFunc + ")";
    console.log("Reformed as: " + returnFunc);
    return function(inputDict) {
        var newFunc = returnFunc.slice(0);
        console.log("Original: " + newFunc);
        for(var index in inputVars) {
            newFunc = newFunc.replace(new RegExp(inputVars[index], "g"), 
                                      inputDict[inputVars[index]]);
        }
        console.log("Replaced with: " + newFunc);
        return eval(newFunc);
    };
}

/*
 * Adds the sum of products result from the output table and input variables
 * of the function.
 */
function addSumOfProducts(outputTable, inputVars) {
    if(outputTable.firstChild.innerHTML.includes("Logic Function")) {
        // no logic table, so change nothing and return
        return;
    }
    console.log("Extracting table data...");
    // get the table data
    var tableData = outputTable.children[1].lastChild.children;
    // generate the sum of products from the table and input variables
    var sumOfProducts = genSumOfProducts(tableData, inputVars);
    console.log("Sum of products: " + sumOfProducts);
    // add the sum of products to the output
    outputTable.innerHTML += "<h3>Sum of Products</h3> <p>" + sumOfProducts +
        "</p";
}

/*
 * Generates the sum of products result from the output table and input 
 * variables of the function.
 */
function genSumOfProducts(tableData, inputVars) {
    var sumOfProducts = "X = ";
    // TODO: actually make it :-)
    for(var rowIndex = 0; rowIndex < tableData.length; rowIndex++) {
        var value = parseInt(
            tableData[rowIndex].children[inputVars.length].textContent);
        if(value === 1) {
            for(var index in inputVars) {
                if(parseInt(tableData[rowIndex].children[
                    index].textContent) === 0) {
                    sumOfProducts += "!";
                }
                sumOfProducts += "" + inputVars[index];
            }
            sumOfProducts += " + ";
        }
    }
    return sumOfProducts.slice(0,-3);
}

/*
 * Adds the unused-variable-reduced sum of products result to the output.
 */
function addReducedSumOfProducts(outputTable, func, inputVars) {
    if(outputTable.firstChild.innerHTML.includes("Logic Function")) {
        // no logic table, so change nothing and return
        return;
    }
    console.log("Determining unused variables...");
    var unusedVars = [];
    for(var varIndex in inputVars) {
        var variable = inputVars[parseInt(varIndex)];
        if(!func.includes(variable)) {
            unusedVars += variable;
        }
    }
    // get the table data
    var sumOfProducts = outputTable.children[3];
    console.log("reducing sum of products");
    // generate the sum of products from the table and input variables
    var reducedSumOfProducts = reduceSumOfProducts(sumOfProducts, unusedVars);
    console.log("Reduced sum of products: " + reducedSumOfProducts);
    // add the reduced sum of products to the output
    outputTable.innerHTML += "<h3>Reduced Sum of Products " + 
        "(ignores unused listed inputs)</h3> <p>" + reducedSumOfProducts + 
        "</p";
}

/*
 * Reduces the given sum of products by removing the unused variables
 */
function reduceSumOfProducts(sumOfProducts, unusedVars) {
    var oldSum = sumOfProducts.innerHTML.slice(4);
    // remove unused variables
    for(var varIndex in unusedVars) {
        oldSum = oldSum.replace(new RegExp("!" +
            unusedVars[varIndex], 'g'), "");
        oldSum = oldSum.replace(
            new RegExp(unusedVars[varIndex],'g'), "");
    }
    // split into components
    var productList = oldSum.split(" + ");
    // initialise reduced sum of products
    var reducedSum = "X = ";
    // add in relevant components (no duplicates)
    for(var productIndex in productList) {
        if(!reducedSum.includes(productList[productIndex])) {
            reducedSum += productList[productIndex] + " + ";
        }
    }
    return reducedSum.slice(0,-3);
}


// FUNCTION COMPARISON

/*
 * Compares two logic functions and tests for equivalency
 */
function funcCompare(func1, func2, validSymbols, inputVars) {
    // deconstruct functions
    var deconFunc1 = deconstructFunc(func1, inputVars, validSymbols);
    var deconFunc2 = deconstructFunc(func2, inputVars, validSymbols);

    // initialise an empty dictionary of inputs:values
    var inputDict = {};
    // populate dictionary with provided inputs
    for(var i=0; i<inputVars.length; i++) {
        inputDict[inputVars[i]] = 0;
    }
    
    var returnArray = [true, ""];

    var nInputs = inputVars.length;
    for(var index=0; index < nInputs*Math.pow(2,nInputs); index++) {
        // Determine current input value
        var inputVal = binaryInput(index, nInputs);
        // Add current input value to dictionary of inputs:values
        inputDict[inputVars[index % nInputs]] = inputVal;
        // output row of inputs to console once row created
        if((index % nInputs) == (nInputs - 1)) { 
            console.log(inputDict);
        }

        if((index % nInputs) == (nInputs - 1)) { // End of row
            var outputVal1 = deconFunc1(inputDict);
            var outputVal2 = deconFunc2(inputDict);
            if(outputVal1 != outputVal2) {
                returnArray[0] = false;
                returnArray[1] += "<br>"
                for(var varIndex in inputVars) {
                    returnArray[1] += inputVars[varIndex] + "=" + 
                        inputDict[inputVars[varIndex]] + ", ";
                }
                returnArray[1] = returnArray[1].slice(0,-2);
            }
        }
    }
    if(!returnArray[0]) {
        returnArray[1] = "Failed on:" + returnArray[1];
    }
    return returnArray;
}


// LISTENER FUNCTIONS

/*
 * Adds the relevant listeners for the tabs
 */
function addTabListeners(conversionTab, conversionElements, equivalencyTab,
                         equivalencyElements, functionLabel, heading) {
    conversionTab.addEventListener('click', 
        function(evt) {
            // set display of conversion elements to standard (initial)
            for(var index=0; index<conversionElements.length; index++) {
                conversionElements[index].style.display = "initial";
            }
            // set display of equivalency elements to none
            for(var index=0; index<equivalencyElements.length; index++) {
                equivalencyElements[index].style.display = "none";
            }
            // update display of tabs
            conversionTab.style.color = "#DD8300";
            conversionTab.style.fontWeight = "bold";
            equivalencyTab.style.color = "grey";
            equivalencyTab.style.fontWeight = "normal";
            // update other displays
            functionLabel.innerHTML = "Input Logic Function:";
            heading.innerHTML = "Logic Function to Table Conversions";
        }, false);
    equivalencyTab.addEventListener('click', 
        function(evt) {
            // set display of equivalency elements to standard (initial)
            for(var index=0; index<equivalencyElements.length; index++) {
                equivalencyElements[index].style.display = "initial";
            }
            // set display of conversion elements to none
            for(var index=0; index<conversionElements.length; index++) {
                conversionElements[index].style.display = "none";
            }
            // update display of tabs
            equivalencyTab.style.color = "#DD8300";
            equivalencyTab.style.fontWeight = "bold";
            conversionTab.style.color = "grey";
            conversionTab.style.fontWeight = "normal";
            // update other displays
            functionLabel.innerHTML = "Initial Logic Function:";
            heading.innerHTML = "Logic Function Equivalency";
        }, false);
}

// --------------------------HELPER FUNCTIONS------------------------------- //

/*
 * Removes the spaces from the inputted string and returns the result.
 */
function removeSpaces(string) {
    var splitString = string.split(" ");
    return splitString.join("");
}

/*
 * Checks if the list contains the specified value.
 */
function listContains(list, value) {
    if(list.indexOf(value) === -1) {
        return false;
    } else {
        return true;
    }
}

/*
 * Sets the input validity to false, and updates the error message.
 */
function inputError(returnArray, message) {
    returnArray[0] = false;
    returnArray[1] += "<br> &emsp;- " + message;
    // Also logs latest error in console
    console.log(message);
}

/* 
 * Calculates the binary input value for the output table, given the current 
 * index and number of inputs.
 */
function binaryInput(index, nInputs) {
    var bin = (Math.floor(index/nInputs)).toString(2);
    var binExtend = zString(nInputs - bin.length) + bin;
    return parseInt(binExtend.charAt((index % nInputs)));
}

/* 
 * Creates a string of zeros, of length 'num'.
 */
function zString(num) {
    var str = "";
    for(var i=0;i<num;i++) {
        str += "0";
    }
    return str;
}