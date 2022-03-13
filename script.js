'use strict';
const account1 = {
  owner: 'Ahmed Ali',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2022-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Osama Sherif',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};
const account3 = {
  owner: 'Mahmoud Yahia',
  movements: [-500, -340, -150, -79, -3210, -1200, 8500],
  interestRate: 1.8,
  pin: 3333,

  movementsDates: [
    '2019-03-01T13:15:33.035Z',
    '2019-06-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-03-05T16:33:06.386Z',
    '2020-06-10T14:43:26.374Z',
    '2020-08-25T18:49:59.371Z',
    '2022-10-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};
const accounts = [account1, account2, account3];
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
let currentAccount, timer;
const displayMovement = function (account, sort = false) {
  containerMovements.innerHTML = '';
  let copyMovements = sort ? currentAccount.movements.slice().sort((a, b) => a - b) : account.movements;
  copyMovements.forEach(function (mov, index) {
    let displayDate = handleMovementDate(account.movementsDates[index]);
    let type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">
            ${index + 1} ${type}
          </div>
           <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${mov.toFixed(2)}$</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
const handleMovementDate = function (date) {
  const substractDates = function (date1, date2) {
    return Math.round(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));
  };
  let daysPassed = substractDates(new Date(), new Date(date));
  const movdate = new Date(date);
  const day = `${movdate.getDate()}`.padStart(2, 0);
  const month = `${movdate.getMonth() + 1}`.padStart(2, 0);
  const year = movdate.getFullYear();
  if (daysPassed === 0) {
    return `Today`;
  }
  if (daysPassed === 1) {
    return `Yesterday`;
  }
  if (daysPassed <= 7) {
    return `${daysPassed} days ago`;
  }
  return `${day}\\${month}\\${year}`;
};
/* <div class="movements__date">${(account.movementsDates[index]).getDate()} \\ ${account.movementsDates[index].getMonth() + 1} \\ ${account.movementsDates[index].getFullYear()}</div>*/
const setUserNames = function (accs) {
  accs.forEach(function (account) {
    account.userName = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

setUserNames(accounts);

const calcDisplayBalance = function (account) {
  let balance = account.movements.reduce(function (acc, cur) {
    return acc + cur;
  }, 0);
  account.balance = balance;
  labelBalance.textContent = `${balance}$`;
  return balance.toFixed(2);
};

const calcDisplaySummary = function (account) {
  const deposits = account.movements
    .filter(function (mov) {
      return mov > 0;
    })
    .reduce(function (acc, cur) {
      return acc + cur;
    }, 0);
  const withdrawals = account.movements
    .filter(function (mov) {
      return mov < 0;
    })
    .reduce(function (acc, cur) {
      return acc + cur;
    }, 0);
  const interests = account.movements
    .filter(function (mov) {
      return mov > 0;
    })
    .map(function (depo) {
      return Math.round((depo * account.interestRate) / 100);
    })
    .reduce(function (acc, cur) {
      return acc + cur;
    }, 0);
  labelSumIn.textContent = `${deposits.toFixed(2)}$`;
  labelSumOut.textContent = `${Math.abs(withdrawals).toFixed(2)}$`;
  labelSumInterest.textContent = `${interests.toFixed(2)}$`;
};

const updateUI = function (account) {
  displayMovement(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
  clearInterval(timer);
  timer = countdownTimer();
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = accounts.find(account => account.userName === inputLoginUsername.value && account.pin === Number(inputLoginPin.value));
  if (currentAccount) {
    labelDate.textContent = new Intl.DateTimeFormat('en-US').format(new Date());
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Good Morning, ${currentAccount.owner.split(' ')[0]}!`;
    updateUI(currentAccount);
    inputLoginUsername.value = inputLoginPin.value = '';
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  let transferedAccount = accounts.find(account => account.userName === inputTransferTo.value);
  if (transferedAccount && currentAccount.balance >= amount && amount > 0) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    transferedAccount.movements.push(amount);
    transferedAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    inputTransferTo.value = '';
    inputTransferAmount.value = '';
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(Number(inputLoanAmount.value));
  if (amount >= 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);
    inputLoanAmount.value = ' ';
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (currentAccount.userName === inputCloseUsername.value && currentAccount.pin === Number(inputClosePin.value)) {
    let closedAccount = accounts.findIndex(account => account.userName === currentAccount.userName && account.pin === currentAccount.pin);
    accounts.splice(closedAccount, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
    inputCloseUsername.value = inputClosePin.value = '';
    clearInterval(timer);
  }
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  clearInterval(timer);
  timer = countdownTimer();
  displayMovement(currentAccount, !sorted);
  sorted = !sorted;
});
/*const countdownTimer = function (min, sec) {
  timer = setInterval(function () {
    if (sec === 0) {
      --min;
      sec = 60;
    }
    --sec;
    labelTimer.textContent = `${(min + '').padStart(2, 0)}:${(sec + '').padStart(2, 0)}`;
    if (sec === 0 && min === 0) {
      clearInterval(counter);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
  }, 1000);
  return timer;
};
*/
const countdownTimer = function (min = 10, sec = 0) {
  const timer = setInterval(function () {
    labelTimer.textContent = `${String(min).padStart(2, 0)}:${String(sec).padStart(2, 0)}`;
    if (sec === 0) {
      --min;
      sec = 60;
    }
    --sec;
    if (sec === 0 && min === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
  }, 1000);
  return timer;
};
