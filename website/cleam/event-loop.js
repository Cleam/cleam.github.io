console.log('start');
setTimeout(() => {
  console.log('timer1');
  Promise.resolve().then(function () {
    console.log('promise1');
  });
}, 0);
setTimeout(() => {
  console.log('timer2');
  Promise.resolve().then(function () {
    console.log('promise2');
  });
}, 0);
Promise.resolve().then(function () {
  console.log('promise3');
});
console.log('end');


// setTimeout(() => {
//   console.log('timer1');
//   Promise.resolve().then(function () {
//     console.log('promise1');
//   });
// }, 0);
// process.nextTick(() => {
//   console.log('nextTick');
//   process.nextTick(() => {
//     console.log('nextTick');
//     process.nextTick(() => {
//       console.log('nextTick');
//       process.nextTick(() => {
//         console.log('nextTick');
//       });
//     });
//   });
// });

// setTimeout(() => {
//   console.log('timer1');
//   Promise.resolve().then(function () {
//     console.log('promise1');
//   });
// }, 0);
// setTimeout(() => {
//   console.log('timer2');
//   Promise.resolve().then(function () {
//     console.log('promise2');
//   });
// }, 0);
