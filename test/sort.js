//
// This tests the performance of a potential sort approach in vtree/diff.
// The benchmark contains the actual code which returns the sorted array
// instead of the moves so we can more efficiently verify the results of the
// algorithm. The move objects are still generated to preserve similarity.
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
// Some work was done to experiment on the performance of the array move
// operation. It appears that the slice approach is always faster in modern
// browsers. Further work is required to see how the performance profile
// changes in other browsers.
//

var PERMUTATION_START = 1;
var PERMUTATION_END = 9;

var SAMPLE_START = 10;
var SAMPLE_END = 1000;
var SAMPLE_COUNT = 100;
var SAMPLE_INTERVAL = 10;

var move = moveSplice;  // Splice appears to be faster in benchmarks

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
    var arrayLength = permutations[0].length;

    console.log('Benchmarking sort for length ', arrayLength);

    var startTime = Date.now();

    for (var i = 0; i < count; i++) {
        sort(permutations[i]);
    }

    var totalTime = Date.now() - startTime;
    var average = totalTime / count >> 0

    console.log('All (' + count + ') arrays sorted in', totalTime, 'ms');
    console.log('An array of length', arrayLength, 'sorts in', average, 'ms');
}

function runSort(permutations) {
    var count = permutations.length;
    var arrayLength = permutations[0].length;

    console.log('Testing sort for length ', permutations[0].length);

    for (var i = 0; i < count; i++) {
        var sorted = sort(permutations[i]);
        assertSorted(sorted, arrayLength);
    }

    console.log('All permutations sorted correctly');
}

function assertSorted(sorted, length) {
    if (sorted.length !== length) {
        throw new Error("Sorted array is longer than expected");
    }

    var testSorted = sorted.slice().sort(numericalSort);

    for (var i = 0; i < testSorted.length; i++) {
        if (testSorted[i] !== sorted[i]) {
            console.log(sorted);
            console.log(testSorted);
            throw new Error("UNSORTED ARRAY");
        }
    }
}

function numericalSort(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
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
        var cur, memo = memo || [];

        for (var i = 0; i < arr.length; i++) {
            cur = arr.splice(i, 1);
            if (arr.length === 0) {
                results.push(memo.concat(cur));
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

        for (j = 0; j < count; j++) {
            samples[j] = shuffle(createArray(i));
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


//
// Code to test/benchmark code begins ----------------------------------------
//

function sort(arr) {
    var arrLength = arr.length;
    var moves = [];

    for (var i = 0; i < arrLength; i++) {
        var item = arr[i];

        if (item !== i) {
            var desiredItemIndex = 0;
            var swapDestination = 0;
            var lessThanSearchHalt = item - i;
            var lessThanSearchCount = 0;

            for (var j = i + 1; j < arrLength; j++) {
                var compareItem = arr[j];

                if (compareItem < item) {
                    lessThanSearchCount += 1;
                    if (lessThanSearchCount === lessThanSearchHalt) {
                        swapDestination = j + 1;
                    }
                }

                if (compareItem === i) {
                    desiredItemIndex = j;
                }

                if (desiredItemIndex > 0 && swapDestination > 0) {
                    break;
                }
            }

            if (swapDestination > desiredItemIndex + 1) {
                moves.push(move(arr, i, swapDestination));
                i--;
            } else {
                moves.push(move(arr, desiredItemIndex, i));
            }
        }
    }

    return arr
}

function moveSplice(array, from, to) {
    array.splice(from < to ? to - 1 : to, 0, array.splice(from, 1)[0]);

    return {
        from: from,
        to: to
    };
}


// Shift instead of splice - slower in benchmarks
function moveShift(arr, from, to) {
    var fromItem = arr[from];
    var i;
    var end;

    if (from < to) {
        end = to - 1;
        for (i = from; i < end; i++) {
            arr[i] = arr[i + 1];
        }
    } else {
        end = to;
        for (i = from; i > to; i--) {
            arr[i] = arr[i - 1];
        }
    }

    arr[end] = fromItem;

    return {
        from: from,
        to: to
    };
}
