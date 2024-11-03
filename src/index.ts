import NepaliDate from './nepali-date';

console.log(new NepaliDate().format());
console.log(new NepaliDate().format('MMM DD, YYYY', 'np'));
console.log(new NepaliDate().format('MMMM D, YYYY, dddd'));
console.log(new NepaliDate().add(1, 'day').toString());
