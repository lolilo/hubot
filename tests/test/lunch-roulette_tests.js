var assert = require('assert')

date_list = require('./../../scripts/lunch_roulette').date_list;
business_logic = require('./../../scripts/lunch_roulette').business_logic;

// compare two arrays in JavaScript,
// http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}   


suite('collect.js', function() {

  test('business_logic', function() {

    // TODO 
    // store can only handle unique names -- should provide error if key already exists in hash map /
    // another Gabor has already registered
    // must use "Gabor2" or something as the key

    // TODO
    // no check to see if employee actually exists. someone could spam random users
    // assume that no one is malicious
    assert.equal("Data successfully recorded.", business_logic('Lilo;14:00'));
    // assert.equal("Data successfully recorded.", business_logic('Lilo;12:29')); // TODO: should this work? 
    assert.equal("Data successfully recorded.", business_logic('Lilo;12:30')); // edge case
    assert.equal("Data successfully recorded.", business_logic('Lilo;14:59')); // edge case

    assert.equal("Data successfully recorded.", business_logic('Lilo;14:00'));
    assert.equal("Data successfully recorded.", business_logic('Matyas;14:20'));
    assert.equal("Data successfully recorded.", business_logic('!!!;14:20'));
    assert.equal(undefined, business_logic('Lilo;15:00'));
    assert.equal(undefined, business_logic('Lilo;12:00'));
    assert.equal(undefined, business_logic('Matyas;140:00'));
    assert.equal(undefined, business_logic('Matyas;14:2980'));
    assert.equal(undefined, business_logic('Matyas;140:2980'));
  });


});


suite('answer.js', function() {

  test('date_list', function() {

    var test_store1 = { Lilo: '14:00',
      Judit: '14:00',
      Matyas: '14:00',
      Eniko: '14:00',
      Ferenc: '14:00',
      Balazs: '14:00' };

    var test_store2 = { Lilo: '14:00',
      Judit: '12:30',
      Matyas: '14:00',
      Eniko: '14:00',
      Ferenc: '12:30',
      Balazs: '14:00' };

    var store_result1 = { '14:00': [ 'Lilo', 'Judit', 'Matyas', 'Eniko', 'Ferenc', 'Balazs' ] };

    var fourteen_result1 = ['Lilo',
                            'Judit',
                            'Matyas',
                            'Eniko',
                            'Ferenc',
                            'Balazs' ];

    var store_result2 = { '14:00': [ 'Lilo', 'Matyas', 'Eniko', 'Balazs' ],
                          '12:30': [ 'Judit', 'Ferenc' ] }; 

    assert.equal(6, date_list(test_store1)['14:00'].length);
    assert.equal(true, date_list(test_store1)['14:00'].equals(fourteen_result1));

    assert.equal(4, date_list(test_store2)['14:00'].length);
    assert.equal(2, date_list(test_store2)['12:30'].length);
    assert.equal(false, date_list(test_store2)['14:00'].equals(fourteen_result1));

    // compare two Objects in JS
    // http://stackoverflow.com/questions/1068834/object-comparison-in-javascript
    assert.equal(true, JSON.stringify(store_result2) === JSON.stringify(date_list(test_store2)));

  });
});