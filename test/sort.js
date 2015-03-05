//
// This tests the performance of vtree/diff.
//
// This test in it's current configuration will test every array permutation of
// N numbers from 0, 2, ... N  for N = 1 up to and including N = 9.
//
// Furthermore, arrays for N 10, 20, 30, ... 1000 are tested. Since the number
// of permutations is a factorial problem, we can't test all permutations for
// these. We generate 100 arrays instead and randomly shuffle them for testing.
//
// Each test is timed in a benchmark version of the test which removes the
// peripheral operations, and each test is also re-run against a validation
// version, which checks to ensure that the arrays are actually sorted.
//
// Essentially this test proves that the sorting algorithm for N 0-based
// consecutive integers works for ALL permutations up to length 9.
//

var PERMUTATION_START = 1;
var PERMUTATION_END = 9;

var SAMPLE_START = 10;
var SAMPLE_END = 1000;
var SAMPLE_COUNT = 100;
var SAMPLE_INTERVAL = 10;

var nodesFromArray = require('./lib/nodes-from-array.js');
var assertChildNodesFromArray = require('./lib/assert-childNodes-from-array.js');

var diff = require('../vtree/diff');
var render = require('../create-element.js');
var patch = require('../patch.js');

var assert = require('assert');

var document = require('global/document');

var testlingOutput = document.getElementById('__testling_output');
if (testlingOutput) {
    testlingOutput.parentNode.removeChild(testlingOutput);
}

runTest();
// validateOnly();
// benchmarkOnly();

function runTest() {
    forEachPermutation(PERMUTATION_START, PERMUTATION_END, testArrays);
    forEachSample(SAMPLE_START, SAMPLE_END, SAMPLE_COUNT, SAMPLE_INTERVAL, testArrays);
}

function testArrays(arrays) {
    runSort(arrays);
    runBench(arrays);
}

function validateOnly() {
    forEachPermutation(PERMUTATION_START, PERMUTATION_END, runSort);
    forEachSample(SAMPLE_START, SAMPLE_END, SAMPLE_COUNT, SAMPLE_INTERVAL, runSort);
}

function benchmarkOnly() {
    forEachPermutation(PERMUTATION_START, PERMUTATION_END, runBench);
    forEachSample(SAMPLE_START, SAMPLE_END, SAMPLE_COUNT, SAMPLE_INTERVAL, runBench);
}

function runBench(permutations) {
    var count = permutations.length;
    var arrayLength = permutations[0].goal.length;

    console.log('Benchmarking sort for length ', arrayLength);

    var startTime = Date.now();

    for (var i = 0; i < count; i++) {
        var item = permutations[i];
        var goal = nodesFromArray(item.goal);
        var shuffled = nodesFromArray(item.shuffled);

        var rootNode = render(shuffled);
        document.body.appendChild(rootNode);
        var reflow = rootNode.offsetWidth;
        var patches = diff(shuffled, goal);
        patch(rootNode, patches);
        reflow = rootNode.offsetWidth;
        document.body.removeChild(rootNode);
    }

    var totalTime = Date.now() - startTime;
    var average = totalTime / count >> 0

    console.log('All (' + count + ') arrays sorted in', totalTime, 'ms');
    console.log('An array of length', arrayLength, 'sorts in', average, 'ms');
}

function runSort(permutations) {
    var count = permutations.length;

    console.log('Testing sort for length ', permutations[0].goal.length);

    for (var i = 0; i < count; i++) {
        var item = permutations[i];
        var goal = nodesFromArray(item.goal);
        var shuffled = nodesFromArray(item.shuffled);

        var rootNode = render(shuffled);
        var patches = diff(shuffled, goal);
        patch(rootNode, patches);

        assertChildNodesFromArray(assert, item.goal, rootNode.childNodes);
    }

    console.log('All permutations sorted correctly');
}

function forEachPermutation(start, end, run) {
    for (var arrayLength = start; arrayLength <= end; arrayLength++) {
        var array = createArray(arrayLength);

        console.log('Generating test permutations for length', arrayLength);
        var permutations = permutator(array);

        run(permutations);
    }
}

function permutator(inputArr) {
    var results = [];

    function permute(arr, memo) {
        memo = memo || [];

        var cur;

        for (var i = 0; i < arr.length; i++) {
            cur = arr.splice(i, 1);
            if (arr.length === 0) {
                results.push({
                    goal: inputArr,
                    shuffled: memo.concat(cur)
                });
            }
            permute(arr.slice(), memo.concat(cur));
            arr.splice(i, 0, cur[0]);
        }

        return results;
    }

    return permute(inputArr);
}

function forEachSample(start, end, count, interval, run) {
    console.log(arguments);
    for (var i = start; i <= end; i += interval) {
        var samples = new Array(count);

        console.log("Generating", count, "sample arrays of length", i);

        for (var j = 0; j < count; j++) {
            var goal = createArray(i);
            samples[j] = {
                goal: goal,
                shuffled: shuffle(goal)
            };
        }

        run(samples);
    }
}

function createArray(arrayLength) {
    var array = new Array(arrayLength);

    for (var numberToAdd = 0; numberToAdd < arrayLength; numberToAdd++) {
        array[numberToAdd] = numberToAdd;
    }

    return array;
}

function shuffle(array) {
    var currentIndex = array.length;
    var temporaryValue;
    var randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
