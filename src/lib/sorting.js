/*

NOTE: When sorting by avalanche, sort by snowball first for optimal interest minimization

*/

/*
Sorts loans descending by interest rate
*/
function snowball(loan1, loan2) {
    return loan2.annualRate - loan1.annualRate;
}

/*
Sorts loans ascending by principal
*/
function avalanche(loan1, loan2) {
    return loan1.principal - loan2.principal;
}

/*
Sorts an array of loans using the provided sortFunc
*/
function sortLoans(loans, sortFunc) {
    return loans.sort(sortFunc);
}
