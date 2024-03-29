


'use strict';

const defaultLanguage = "en";
const BASE_URI = "http://localhost:5000";
const API_PREFIX = "/api";
const API_METHOD = {
    // post
    accept: '/accept',
    authorize: '/authorize',
    unpackdata: '/unpackdata',
    packdata: '/packdata',
    scanCard: '/scancard',
    complete: '/sompleteSession',
    //get
    getPdf: '/getPdf',
    paylist: '/paylist',
    getdetails: '/getdetails',
    completeSession: '/completeSession',
    export: '/getPdf',
    getAgreement: "/getAgreement",
    getTranslation: "/getTranslation"
}

let agreementHasLoaded = false;
  
let paymentData = {
    amount: {
        currency: '$',
        amount: 120,
        tax: 0
    },
    tvc: 4444,
    facilityData: {
        initiatorId: 1,
        initiator: 'Ivan Petrov',
        merchant: 'Chudinov Yuri',
        merchantId: '31435110',
        email: "aws@gmail.com",
        phone: "380675556688",
        account: "0000000000",
        address: 'Some address',
        iban: 'UA  XX  XXXXXX  XXXXXXXXXXXXXXXXXXXX',
    }
};

const errorClasses = {
    span: "dsp-block",
    input: "invalid"
}

function getErrorSpans (selector) {
  return getEl(`${selector}-error-span`);
}

let formState = {
    login: true,
    password: true,
    language: "",
    langClass: false
}

const ourLanguages = ["ru","en","sp"];

//variables
const patterns = {
  customerPattern: null,
  authorizedCustomerPattern: /^[a-zA-Z]+ [a-zA-Z]+?$/,
  verifyCodePattern: /^[0-9]{2,4}$/,
  emailPattern: /^[^@\s]+@[^@\s]+\.[^@\s]{2,5}$/,
  cardNumberPattern: /[\d]{16}/,
  cvcPattern: /[\d]{3}/
};
let authorizedUser = false;
let hasCard = false;
let errorPayload = {};
let payMethodList;
let loginToken;
let _cardToken;
  
//   CONSTANTS FOR vALIDATION METHOD
const EMAIL = "email";
const LOGIN = "login";
const PASSWORD = "password";
const CUSTOMER = "customer";
const VERIFY_CODE = "verifyCode";
const CARDS = "cards";
const AUTHORIZED_CUSTOMER = "authorizedCustomer";
const FAIL_STATUS = 'S_FAIL';
const OK_STATUS = 'S_OK';
//   CONSTANTS FOR vALIDATION METHOD
const {body} = document;
const wordContainers = body.querySelectorAll('[data-lang-tag]');
const langContainers = body.querySelectorAll('[data-lang]');

const messages = {
    ru: {
        email: {
            required: "Обязательное поле",
            less: "Минимум 4 символа",
            more: "Не более 75 символов",
            incorrect: "Не верный формат ввода"
        },
        password: {
            required: "Обязательное поле",
            incorrect: "Не меннее 3 символов",
        },
        login: {
            required: "Обязательное поле",
            incorrect: "Не меннее 3 символов",
        },
        customer: {
            required: "Обязательное поле",
            incorrect: ""
        },
        verifyCode: {
            required: "Обязательное поле",
        },
        authorizedCustomer: {
            required: "Обязательное поле",
            incorrect: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)"
        },
        cards: {
            required: "Выберите карту",
            incorrect: "Неверный формат данных"
        },
        cardNumber: {
          required: "Обязательное поле",
          incorrect: "Должно быть 16 символов",
        },
        expMonth: {
          required: "Выберите дату",
        },
        cvc: {
          required: "Обязательное поле",
          incorrect: "Должно быть 3 символа",
        }
    },
    en: {
        email: {
            required: "Required field",
            less: "Should be more than 3 symbols",
            more: "Should be less than 75 symbols",
            incorrect: "Incorrect format"
        },
        password: {
            required: "Required field",
            less: "Should be not less than 3 symbols",
        },
        login: {
            required: "Required field",
            less: "Should be not less than 3 symbols",
        },
        customer: {
            required: "Should be (3-4 digits) or name (ie. Ivan Petrov)",
        },
        verifyCode: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
        },
        authorizedCustomer: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
        },
        cards: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
        },
        cardNumber: {
          required: "Required field",
          incorrect: "Should be 16 symbols",
        },
        expMonth: {
          required: "Select the date",
        },
        cvc: {
          required: "Required field",
          less: "Should be 3 symbols",
        }
    },
    sp: {
        email: {
            required: "Campo obligatorio",
            less: "No debe tener menos de 4 símbolos",
            more: "No debe tener más de 100 símbolos",
            incorrect: "formato incorrecto"
        },
        password: {
            required: "Campo obligatorio",
            less: "No debe tener menos de 3 símbolos",
        },
        login: {
            required: "Campo obligatorio",
            less: "No debe tener menos de 3 símbolos",
        },
        customer: {
            required: "Debe ser (3-4 dígitos) o un nombre(Ivan Petrov)",
            //required:"Please input CVV (3-4 digits) or Valid holder name (ie. Ivan Petrov)",
        },
        verifyCode: {
            required: "Debe ser (3-4 dígitos) o un nombre(es decir, Ivan Petrov)",
            // required:"Please input CVV (3-4 digits) or Valid holder name (ie. Ivan Petrov)",
        },
        authorizedCustomer: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
            // required:"Please input CVV (3-4 digits) or Valid holder name (ie. Ivan Petrov)",
        },
        cards: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
            // required:"Please input CVV (3-4 digits) or Valid holder name (ie. Ivan Petrov)",
        },
        cardNumber: {
          required: "Campo obligatorio",
          incorrect: "16 símbolos",
        },
        expMonth: {
          required: "Select the date",
        },
        cvc: {
          required: "Campo obligatorio",
          less: "3 símbolos",
        }
    },
}
const dictionary = {
    ru: {
        language: "Язык:",
        en: "АН",
        ru: "РУ",
        sp: "ИС",
        mainlang: "РУ",
        expmonth: "Exp Month/Year",
        cvc: "CVC",
        cardnumber: "Card Number",
        cardmanually: "I want input card manually",
        welcometoconteon: "Welcome to Conteon",
        acceptmanualcard: "By Accepting manual card input I agree with service ",
        agreement: "agreement ",
        cardproceed: "of card proceed",
        proceedpayments: "Proceed payments with safe and simple way",
        paybypay: "Pay by Apple Pay/Google Pay",
        startbutton: "Let’s start",
        facilitytitle: "Данные Мерчанта",
        initiatordetails: "Сведения об инициаторе:",
        amount: "Количество:",
        trantvc: "TRAN TVC:",
        paybycard: "Оплатить картой",
        paybycrypto: "Другой метод оплаты",
        cvvorholder: "CVV или имя держателя:",
        scancardbyemitter: "",
        putcardtoemitter: "Приложите карту к imetter",
        login: "Логин",
        password: "Пароль",
        rememberme: "Запомни меня",
        customer: "Клиент:",
        card: "Карта:",
        byconfirmyou: "Подтверждая, вы принимаете ",
        byconfirmyoulink: "условия использования",
        scancardbutton: "Сканировать",
        confirmbutton: "Подтвердить",
        singinbutton: "Войти",
        agreebutton: "Согласиться",
        thankyou: "Спасибо",
        clickdone: "Нажмите кнопку «Готово», чтобы получить квитанцию и завершить эту операцию",
        remember: "Запомнить ",
        cardtoken: "Токен Карты",
        securelystoring: "Мы надежно храним токен карты в хранилище вашего браузера",
        register: "Зарегистрироваться ",
        meinconteon: "в Conteon",
        sendaninvitation: "Мы отправляем пригласительное письмо со ссылкой на почту выше",
        emaillabel: "Электронная почта:",
        completebutton: "Завершить",
        badthing: "Что-то пошло не так",
        closebutton: "Закрыть",
        scanning: "Сканирование",
        updatecard: "Обновить карту",
        choosewallet: "Выбрать кошелек",
        /////FACILITY DATA /////////////////////////
        initiatorId: "Идентификатор",
        initiator: 'Инициатор',
        merchant: 'Мерчант',
        merchantId: 'id мерчанта',
        email: "Имейл",
        phone: "Телефон",
        account: "Счет",
        address: 'Адрес',
        iban: 'IBAN код',
        /////FACILITY DATA ///////////////////////// 
    },
    en: {
        language: "Language",
        mainlang: "EN",
        en: "EN",
        ru: "RU",
        sp: "ES",
        expmonth: "Exp Month/Year",
        cvc: "CVC",
        cardnumber: "Card Number",
        cardmanually: "I want input card manually",
        acceptmanualcard: "By Accepting manual card input I agree with service ",
        agreement: "agreement ",
        cardproceed: "of card proceed",
        welcometoconteon: "Welcome to Conteon",
        proceedpayments: "Proceed payments with safe and simple way",
        paybypay: "Pay by Apple Pay/Google Pay",
        startbutton: "Let’s start",
        facilitytitle: "Merchant Data",
        initiatordetails: "Initiator details:",
        amount: "Amount:",
        trantvc: "TRAN TVC:",
        paybycard: "Pay by Card",
        paybycrypto: "Another Method",
        cvvorholder: "CVV or Holder Name:",
        scancardbyemitter: "Scan Card by Emitter",
        putcardtoemitter: "Put card to imetter",
        login: "Login",
        password: "Password",
        rememberme: "Remember me",
        customer: "Customer:",
        card: "Card:",
        byconfirmyou: "By Confirm you are accept ",
        byconfirmyoulink: "service conditions",
        scancardbutton: "Scan Card",
        confirmbutton: "Confirm",
        singinbutton: "Sign In",
        agreebutton: "Agree",
        thankyou: "Thank You",
        clickdone: "Please click Done button to get receipt and complete this operation",
        remember: "Remember ",
        cardtoken: "Card Token",
        securelystoring: "We securely storing card token in your browser storage",
        register: "Register ",
        meinconteon: "Me in Conteon",
        sendaninvitation: "We send an invitation mail with the link on mail above",
        emaillabel: "Email:",
        completebutton: "Complete",
        badthing: "Bad thing happens",
        closebutton: "Close",
        scanning: "Scanning",
        updatecard: "Update Card",
        choosewallet: "Choose Wallet",
        /////FACILITY DATA /////////////////////////
        initiatorId: "InitiatorId",
        initiator: 'Initiator',
        merchant: 'Merchant',
        merchantId: 'MerchantId',
        email: "Email",
        phone: "Phone",
        account: "Account",
        address: 'Address',
        iban: 'IBAN',
        /////FACILITY DATA /////////////////////////
    },
    sp: {
        language: "Idioma",
        mainlang: "ES",
        en: "IN",
        ru: "RU",
        sp: "ES",
        expmonth: "Exp Month/Year",
        cvc: "CVC",
        cardnumber: "Card Number",
        cardmanually: "I want input card manually",
        acceptmanualcard: "By Accepting manual card input I agree with service ",
        agreement: "agreement ",
        cardproceed: "of card proceed",
        welcometoconteon: "Welcome to Conteon",
        proceedpayments: "Proceed payments with safe and simple way",
        paybypay: "Pay by Apple Pay/Google Pay",
        startbutton: "Let’s start",
        facilitytitle: "Datos del Comerciante",
        initiatordetails: "Detalles del iniciador:",
        amount: "Monto:",
        trantvc: "TRAN TVC:",
        paybycard: "Pagar con tarjeta",
        paybycrypto: "Otro método",
        cvvorholder: "CVV o nombre del titular:",
        scancardbyemitter: "Escanear tarjeta por emisor",
        putcardtoemitter: "Put card to imetter",
        login: "Acceso",
        password: "Contraseña",
        rememberme: "Recuérdame",
        customer: "Cliente:",
        card: "Tarjeta:",
        byconfirmyou: "Confirma que estás aceptado ",
        byconfirmyoulink: "condiciones de servicio",
        scancardbutton: "Escanear tarjeta",
        confirmbutton: "Confirmar",
        singinbutton: "Registrarse",
        agreebutton: "Estar de acuerdo",
        thankyou: "Gracias",
        clickdone: "Haga clic en el botón Listo para obtener el recibo y completar esta operación",
        remember: "Recuerda ",
        cardtoken: "Tarjeta Token",
        securelystoring: "Almacenamos de forma segura el token de la tarjeta en el almacenamiento de su navegador",
        register: "Registrarse ",
        meinconteon: "Yo en Conteon",
        sendaninvitation: "Enviamos un correo de invitación con el enlace en el correo de arriba",
        emaillabel: "Correo electrónico:",
        completebutton: "Completo",
        badthing: "Sucede algo malo",
        closebutton: "Cerrar",
        scanning: "Escaneo",
        updatecard: "Tarjeta de actualización",
        choosewallet: "Elija billetera",
        /////FACILITY DATA /////////////////////////
        initiatorId: "InitiatorId",
        initiator: 'Iniciador',
        merchant: 'Comerciante',
        merchantId: 'ComercianteId',
        email: "Correo electrónico",
        phone: "Teléfono",
        account: "Cuenta",
        address: 'Dirección',
        iban: 'IBAN',
        /////FACILITY DATA /////////////////////////
    }
};

let myApp = {}
myApp.validation = {
  setErrorUI : function ({status, code, message, formSelector, fieldSelector}) {
    const input = getEl(fieldSelector, formSelector);
    input.classList.add(errorClasses.input);
    addSpanErrorStyles(formSelector, fieldSelector, message);
    setFormState(false, fieldSelector);
  },
   removeErrorUI: function ({status, code, message, formSelector, fieldSelector}) {
    const input = getEl(fieldSelector, formSelector);
    console.log(input);
    input.classList.remove(errorClasses.input);
    removeSpanErrorStyles(formSelector, fieldSelector, message);
    setFormState(true, fieldSelector);
  },
  form: function (formSelector, fields) {
    let allValidInfo = {
      status: OK_STATUS,
      validFieldsInfo: []
    };
    fields.forEach(selector => {
      let el = getEl(selector, formSelector);
      let typeOfValidation = el.dataset.validate;
      let validation = this.field(formSelector, selector, typeOfValidation, el.value);

      if (validation.status == FAIL_STATUS) {
        this.setErrorUI(validation);
        allValidInfo.status = FAIL_STATUS;
      } else {
        this.removeErrorUI(validation)
      }
      allValidInfo.validFieldsInfo.push(validation);
    })
    return allValidInfo
  },
  field: function(formSelector, fieldSelector, typeOfValidation, val) {
    // remove spaces in cardNumber
    if (typeOfValidation == 'cardNumber') val = val.replace(/\s/g, '');

    if (typeOfValidation == 'customer' && val == 'cvv') patterns.customerPattern = /^cvv$/;
    if (!val.length) {
      return {
          status: FAIL_STATUS,
          code: 3,
          message: messages[formState.language][typeOfValidation].required,
          formSelector: formSelector,
          fieldSelector: fieldSelector
        }
    }
    if (patterns[`${typeOfValidation}Pattern`] && !patterns[`${typeOfValidation}Pattern`].test(val)) {
      console.log(patterns.customerPattern);
      return {
          status: FAIL_STATUS,
          code: 3,
          message: messages[formState.language][typeOfValidation].incorrect,
          formSelector: formSelector,
          fieldSelector: fieldSelector
        }
    }
    return {
        status: OK_STATUS,
        code: null,
        message: '',
        formSelector: formSelector,
        fieldSelector: fieldSelector
      }
  }
};

function exportFile(url, content) {
  return fetch(`${BASE_URI}${API_PREFIX}${url}`, {
      method: 'GET',
      headers: {
      'Content-Type': typeof content === 'string' ? 'plain/text' : 'application/json'
      },
      body: content,
  }).then((response) => response.blob());
}

myApp.basePost = function (url, content, isText = false) {
  const contentType = typeof content === 'string' ? 'plain/text' : 'application/json';
  const body = typeof content === 'string' ? content : JSON.stringify(content);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URI}${API_PREFIX}${url}`);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.onload = () => resolve(isText ? xhr.responseText : JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send(body);
  });
}

myApp.baseGet = function (url, content = '', isText = false) {
  const params = typeof content === 'string' ? content : JSON.stringify(content);
  const contentType = typeof content === 'string' ? 'plain/text' : 'application/json';

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `${BASE_URI}${API_PREFIX}${url}/${params}`);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.onload = () => resolve(isText ? xhr.responseText : JSON.parse(xhr.responseText));
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}

function render(dictionary, lang) {
  for (const container of wordContainers) {
		if (container.dataset.langTag ==='scancardbyemitter') {
			if( _cardToken == null)
				container.innerText = dictionary[container.dataset.langTag];
			continue;
		}				
		container.innerText = dictionary[container.dataset.langTag];
    };
    setFormState(lang, "language");
	  agreementHasLoaded = false;
    renderFacilityData();
};

// Language
function translate(lang) {
  formState.language !== lang && render(dictionary[lang], lang);
}

function switcher(event) {
    event.stopPropagation();
    translate(event.target.dataset.lang);
    toggleLangList(event);
};

for (const lang of langContainers) {
    lang.addEventListener('click', switcher);
}

function detectLanguage(lang) {
  const stLang = localStorage.getItem("language");
  if (stLang !== null) {
      translate(stLang);
  } else {
    const index = ourLanguages.findIndex(e => e === lang);
    index === -1 ? translate(defaultLanguage) : translate(lang);
  }
}

// Create Promise with validated field and data
function dataSourcePromise (formSelector, requiredFields, data, postParam) {
  //TODO data  is a temp argument. Real data will be received due basePost(postParam)
  return new Promise((resolve, reject) => {
    let validInfo = myApp.validation.form(formSelector, requiredFields);
    if (validInfo.status == 'S_OK') {
      resolve({
        validInfo: validInfo,
        data: data
      });
    } else {
      reject({
        validInfo: validInfo,
        data: data
      });
    }
  })
}

//scanCard Data
function scanCardPromise (datasource) {
  return new Promise((resolve, reject) => {
    datasource.then(res => {
      console.log(res);
      if (res.validInfo.status == 'S_FAIL') {
        reject(res)
      } else {
          if (isNaN(+res.data)) {
            resolve({
              validInfo: res.validInfo,
              data: {
                customer: res.data,
                tokenName: "34*21***34",
                tokenValue: "MzQqMjEqKiozNC5ZQU5BIFNUUg=="
              }
            })
          } else {
            resolve({
              validInfo: res.validInfo,
              data: {
                customer: "cvv",
                tokenName: "34*21***34",
                tokenValue: "MzQqMjEqKiozNC4xMTE="
              }
            })
            
          }
      }
    }).catch(err => reject(err))
  })
}

//scanCard UI
function scanCard() {
  const customerInput = getEl('#customer');
  const scanButton = getEl('#scanCard');
  const cardNumber = getEl('#cardInfo');
  const requiredFields = ['#customer'];
  const data= customerInput.value;
  
  scanButton.innerText = dictionary[formState.language].scanning;
  scanButton.toggleAttribute('disabled');

  scanCardPromise(dataSourcePromise('#todo', requiredFields, data))
    .then(({validInfo, data}) => {
      console.log(data);
      customerInput.value = data.customer;
      cardNumber.innerText = data.tokenName;
    })
    .catch(err => console.log(err))
    .finally(()=>{
      setFormState(true, 'customer');
      scanButton.toggleAttribute('disabled');
      getEl('#submitButton').disabled = false;
      scanButton.textContent ='Обновить карту';	  
    });
}

// subscription
function initSubscription() {
  getEl('#byCard').addEventListener('change', () => {
    togglePaymentMethod();
    togglePaymentTypeForm();
    disableSubmit();
    hasCard && enableSubmit();
  });

  getEl('#byCrypto').addEventListener('change', () => {
    togglePaymentMethod();
    togglePaymentTypeForm();
    disableSubmit();
    authorizedUser && enableSubmit();
  });

  getEl('#scanCard').addEventListener('click', () => scanCard());
  getEl('#signIn').addEventListener('click', () => signIn());
  getEl('#submitButton').addEventListener('click', () => onFormSubmit());
  getEl('#merchantHeader').addEventListener('click', () => toggleExpand());
  getEl('#registerUser')
      .addEventListener('change', () => getEl('#emailContainer').toggleAttribute('hidden'));
  document.querySelectorAll('.checkbox')
      .forEach(item => item.addEventListener('change', () => item.toggleAttribute('checked')));
  }

function togglePaymentMethod() {
  getEl('#byCard').toggleAttribute('checked');
  getEl('#byCrypto').toggleAttribute('checked');
}

function toggleExpand() {
  getEl('#merchantHeader').classList.toggle('expand');
}

function toggleLangList(event) {
  const langList = getEl('#lang-list');
  event.stopPropagation();
  if(!formState.langClass){
      langList.classList.add("dsp-block");
      setFormState(true, "langClass");
  } else {
    langList.classList.remove("dsp-block");
    setFormState(false, "langClass");
  }
}

function abortClickOnParent(event) {
  event.stopPropagation();
}

function fillCardForm() {
  let data = localStorage.getItem(`ctr-${paymentData.facilityData.merchantId}-token`);
  if (data) {
    hasCard = true;
    myApp.basePost(API_METHOD.unpackdata, {"value": data})
      .then((payload) => {
        getEl('#scanCard').innerText = dictionary[formState.language].updatecard;
        getEl('#cardNumber').innerText = payload.tokenName;
        getEl('#customer').value = payload.customer;
        getEl('#cardToken').value = payload.tokenValue;
        enableSubmit();
        _cardToken = payload;
      });
  }
}

//signIn
function signInPromise (datasource) {
  return new Promise((resolve, reject) => {
    datasource.then(res => {
      if (res.validInfo.status == 'S_FAIL') {
        reject(res)
      } else {
          let {login, password} = res.data;
          if (login == 'demo' && password == 'demo') {
          resolve({
            validInfo: res.validInfo,
            data: {
              customer: "YURII CHUDINOV",
              hash: "ZGVtby9kZW1v",
              language: "en"
            }
          })
        } else {reject(res)}
      }
    }).catch(err => reject(err))
  })
}
function signIn() {
  const requiredFields = ['#login', '#password'];
  const data= {login: getEl('#login').value,
            password: getEl('#password').value};

  signInPromise(dataSourcePromise('#todo', requiredFields, data))
  .then(({validInfo, data}) => {
    loginToken = data;
    signInSuccess(data);
    setFormState("customer", data.customer);
    enableSubmit();
  }).catch(err => console.log(err))
}

//signInSuccess
function signInSuccessPromise (response) {
  return new Promise((resolve, reject) => {
    if (getEl('#rememberMe').checked && !localStorage.getItem('ctn-auth-data')) {
      //TODO basePost(API_METHOD.packdata, response, true)
        localStorage.setItem('ctn-auth-data', 'eyJjdXN0b21lciI6IllVUklJIENIVURJTk9WIiwiaGFzaCI6IlpHVnRieTlrWlcxdiIsImxhbmd1YWdlIjoiZW4ifQ');
    }
    if (response || localStorage.getItem('ctn-auth-data')) {
      resolve({
          customer: "YURII CHUDINOV",
          methods: [
            {
              currency: "$",
              tokenName: "34*21***34",
              tokenValue: "JSYcB0fD5Brute1Br7q+P06gzyCxZOtz+4z0yhXtxaAByrzsembhhOOVKCJo+IELX2zKssy3f8E7qAu6zhoEAfBMQOT90sTovko8HDvICgML6WqpIxPTSUv6sNFaJrbIkCcyGw==",
              type: "1"
            },
            {
              currency: "$",
              tokenName: "26*14***12",
              tokenValue: "t5wNjafi84J6YoZyngiu5K9b3tx495kDIfONmJNzixSV7ktv3NwBQB9Rzul0PTNSd9IZNUlVosADCmy0VFvuBtZx3a+8PwjSWZ28JyivjuO/OyDBWlbKQEuLa9FwTevEY8cSAg==",
              type: "1"
            },
            {
              currency: "$",
              tokenName: "10*00***03",
              tokenValue: "YIOVN8lG3KuYe5hTe4j0GTosrICnnGMx1DZiC7H4w2CdjII8pej4FHoep8/yF1bnWNKKNxuSW8MfY2OS49D6oLg3tu8FuHNRM5gGiPWUPrzgerPfbYxFCjC+HEKFZTCpJAYXuw==",
              type: "2"
            }
          ]
      })
    }
  })
}
function signInSuccess(response) {
  signInSuccessPromise(response).then( res => {
    authorizedUser = true;
    toggleAuthForm();
    fillAuthForm(res);
  }).catch(err => console.log(err));
}

function fillAuthForm(data) {
  getEl('#authorizedCustomer').value = data.customer;
  fillOptions(data.methods);
}

function fillOptions(data) {
  const select = getEl('#cards');
  data.forEach(item => {
    const option = document.createElement('option');
    option.innerText = item.tokenName;
    option.value = item.tokenValue;
    select.appendChild(option);
  });
}

// submit action
function onFormSubmitPromise (datasource) {
  return new Promise((resolve, reject) => {
    datasource.then(res => {
        resolve({validInfo: res.validInfo, data: res.data}) 
    }).catch(err => {
      reject(err);
    })
  })
}

function onFormSubmit() {
  const dealData = buildDeal();
  // TODO instead of hardcode 'payload' it should be url for basePost
  let payload = {
    "status": "S_OK",
    "dealCode": "3434333100000002",
    "dealDate": "2021-12-08T14:36:10.6874041Z",
    "internalCode": 0
  }

  let requiredFields = getEl('#byCard').checked ? ['#verifyCode', '#customer'] : ['#verifyCode', '#authorizedCustomer', '#cards'];

  if (getEl('#byCard').checked && getEl('#customer').value.toLowerCase() === 'cvv') {
    requiredFields = requiredFields.filter(item => item !== 'customer');
  }

  onFormSubmitPromise(dataSourcePromise('#todo', requiredFields, payload, 'API_METHOD.accept, dealData(), true'))
    .then(res => {
      initSuccessPage();
    })
    .catch(res => {
        errorPayload.Code = res.data.internalCode;
        errorPayload.Text = res.data.status;
        initErrorPage();
    })
    .finally( () => {
      getEl('#formContainer').setAttribute('hidden', 'true');           
    });
}

function initSuccessPage() {
  getEl('#formContainer').setAttribute('hidden', 'true');
  getEl('#successContainer').removeAttribute('hidden');
  getEl('#completePayment').addEventListener('click', () => onCompletePayment());
}

function initErrorPage() {
  getEl('#formContainer').setAttribute('hidden', 'true');
  getEl('#errorMessage').innerText = `Error: ${errorPayload.Text}`;
  getEl('#errorContainer').removeAttribute('hidden');
}

function onCompletePayment() {
  const emailInput = getEl('#email');
  const data = {
    registerMe: getEl('#registerUser').checked,
    email: emailInput.value || null
  };

  getEl('#rememberCard').checked && rememberCardToken();
  getEl('#registerUser').checked && myApp.validation.form('#email-form', ["#email"]);
  localStorage.setItem("language", formState.language);

  exportFile(API_METHOD.export)
      .then(payload => {
        downloadFile(payload);
      })

  myApp.basePost(API_METHOD.completeSession, data)
  .finally(() => {
    window.location = "http://ledger.conteon.io";
  })
}

function downloadFile(blob, fileName = 'Payment') {
  const link = document.createElement('a');
  // create a blobURI pointing to our Blob
  link.href = URL.createObjectURL(blob);
  link.setAttribute('hidden', 'true');
  link.download = fileName;
  // some browser needs the anchor to be in the doc
  document.body.append(link);
  link.click();
  link.remove();
  // in case the Blob uses a lot of memory
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
};

function rememberCardToken() {
  const keyName = `ctr-${paymentData.facilityData.merchantId}-token`;
  if (getEl('#byCrypto').checked) {
    const cards =  getEl('#cards');
    const option = cards.options[cards.options.selectedIndex];  
    const data = {
      tokenName: option.textContent,
      tokenValue: option.value,
      customer: getEl('#authorizedCustomer').value
    };
    myApp.basePost(API_METHOD.packdata, data, true).then(payload => {
      localStorage.setItem(keyName, payload);
    });
  }
    
  if (getEl('#byCard').checked) {
    myApp.basePost(API_METHOD.packdata, _cardToken, true)
        .then(payload => {
          localStorage.setItem(keyName, payload);
        });
    }
}

function buildDeal() {
  let payload;

  if (getEl('#byCard').checked) {
    payload = _cardToken;
  } else {
    payload = {
      "customer": getEl('#authorizedCustomer').value,
      "token": getEl('#cards').value
    };
  }
  return payload;
}

// CHANGE FORM STATE
function setFormState(state, inputName) {
  const prewState = {...formState};
  prewState[inputName] = state;
  const newState = {...prewState};
  return formState = {...newState};
}

// TOGGLE ERROR STYLES ON SPANS
function addSpanErrorStyles(formSelector, elementSelector, error) {
  const element = getEl(elementSelector, formSelector).nextElementSibling;
  element.classList.add(errorClasses.span);
  element.textContent = error;
}

// TOGGLE ERROR STYLES ON SPANS
function removeSpanErrorStyles(formSelector, elementSelector, error) {
  const element = getEl(elementSelector, formSelector).nextElementSibling;
  element.classList.remove(errorClasses.span);
  element.textContent = error;
}

// form methods and get elements methods
function togglePaymentTypeForm() {
  [getEl('#formCard'), getEl('#formByCrypto')]
      .forEach(element => element.toggleAttribute('hidden'));
}

function toggleAuthForm() {
  [getEl('#formSignIn'), getEl('#authorizedForm')]
  .forEach(element => element.toggleAttribute('hidden'));
}

function disableSubmit() {
  const button = getEl('#submitButton');
  button.disabled = true;
}

function enableSubmit() {
    const button = getEl('#submitButton');
    button.disabled = false;
}

function getEl(el, parent = null) {
  if (parent != null) {
    return document.querySelector(`${parent} ${el}`);
  }

  return document.querySelector(el);
}

function renderFacilityData() {
  const facilityData = getEl("#merchantData");
  const initiator = getEl("#initiator");
  const amount = getEl("#amount");
  const verifyCode = getEl("#verifyCode");
  let html = "";

  Object.entries(paymentData.facilityData)
      .filter(([key]) => key !== 'initiator')
      .forEach(([key, value]) => {
          const translatedTitleText = dictionary[formState.language][key];
          const title = `<span data-lang-tag="${key}">${translatedTitleText}:</span>`;
          const data = `<span class="data">${value}</span>`;
          html += `<p>${title} ${data}</p>`;
      });

  facilityData.innerHTML = html;
  initiator.value = paymentData.facilityData.initiator;
  amount.value = paymentData.amount.currency + paymentData.amount.amount;
  verifyCode.value = paymentData.tvc;
}

  // MODAL
  
getEl(".myBtn").addEventListener('click', function() {
  const modal = getEl("#myModal");
  if(!agreementHasLoaded) {
		myApp.baseGet(API_METHOD.getAgreement, formState.language, true)
			.then(responce => {
				modal.innerHTML = responce
				const closeBtn = getEl("#modalCloseBtn");
				closeBtn.onclick = function () {
				  modal.style.display = "none";
				}
				agreementHasLoaded = true;
			});
		}
    modal.style.display = "block";
})



function mask (selector, matrix) {

  function setCursorPosition (pos, el) {
    el.focus();
    if (el.setSelectionRange) {
        el.setSelectionRange(pos, pos);
    } else if (el.createTextRange) {
        let range = el.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
  }

  function createMask(e) {
    let i = 0,
        val = this.value.replace(/\D/g, '');

        this.value = matrix.replace(/./g, function (a) {
            if (/[_\d]/.test(a) && (i < val.length)) {
              return (val.charAt(i++))
            } else  if (i >= val.length){ return '' }
            else {return a}
        })
        setCursorPosition(this.value.length, this);
    }
    let input = getEl(selector);
    input.addEventListener('input', createMask);
    input.addEventListener('focus', createMask);
}

function welcome() {
  let payByCardBlock = getEl('[data-related-block="payByCard"]');
  let startBtn = getEl('#start button');
  let cardManuallyForm = getEl('#card-manually-from');
  
  getEl('#payByPay').addEventListener('click', function() {
    cardManuallyForm.hidden = true;
    startBtn.disabled = false;
    //cardManuallyForm.hidden = true;
    startBtn.addEventListener('click', function(){
      setDisplayNone('.welcome-container');
      getEl('#formContainer').hidden = false;
    })
  });

  getEl('#payByCard').addEventListener('click', function() {
    //payByCardBlock.hidden = false;
    startBtn.disabled = true;
    cardManuallyForm.hidden = false;

    getEl('#cardManually').addEventListener('click', function() {
      cardManuallyForm.querySelectorAll('input').forEach(input => {
        input.toggleAttribute('disabled');

      });
      getEl('#cvvorholder').toggleAttribute('disabled');
      getEl('#scanCard-welcome').toggleAttribute('disabled');
      startBtn.disabled = false;
    });

    getEl('#scanCard-welcome').addEventListener('click', function (e) {
      e.preventDefault();
      getEl('.scan-card-text').dataset.langTag = 'putcardtoemitter';
      getEl('.scan-card-text').textContent = 'Приложите карту к emitter';
      setTimeout(function() {
        setDisplayNone('.scan-card-text');
        setDisplayNone('.cardManually-container');
        getEl('.scan-card-text').parentNode.style.justifyContent = 'end';

        getEl('#cardNumber').value = '1111 2222 3333 4444';
        getEl('#cardNumber').disabled = false;

        setDisplayNone('.cvc-wraper');
        getEl('.expMonth-wraper').classList.remove('float-left');
        getEl('#expMonth').value = "2017-06-01";
        getEl('#expMonth').disabled = false;
        startBtn.disabled = false;

      }, 1000);
    })

    startBtn.addEventListener('click', function(){
      let requiredFields = getEl('#cardManually').checked ? ['#cardNumber', '#cvc', '#expMonth'] : ['#cardNumber', '#expMonth','#cvvorholder']
      let validInfo = myApp.validation.form('#card-manually-from', requiredFields);
      if (validInfo.status == OK_STATUS) {
        const formData = new FormData(cardManuallyForm);
        let obj = {}

        formData.forEach(function (value, key) {
          obj[key] = value;
        });

        let json = JSON.stringify(obj);
        
        getEl('.welcome-container').style.display = 'none';
        getEl('#formContainer').hidden = false;
      }
      getEl('#customer').value = getEl('#cvvorholder').value;

      let data
      if (isNaN(+(getEl('#customer').value))) {
        data = {
          customer: res.data,
          tokenName: "34*21***34",
          tokenValue: "MzQqMjEqKiozNC5ZQU5BIFNUUg=="
        }
      } else {
        data = {
          customer: "cvv",
          tokenName: "34*21***34",
          tokenValue: "MzQqMjEqKiozNC4xMTE="
        }
        
      }

      getEl('#customer').value = data.customer;
      getEl('#cardInfo').innerText = data.tokenName;
      setFormState(true, 'customer');
      getEl('#submitButton').toggleAttribute('disabled');
      getEl('#scanCard').textContent ='Обновить карту';	
    })
  });
function setDisplayNone (selector, parent = null) {
  getEl(selector, parent).style.display = 'none';
}
function setDisplayBlock (selector) {
  getEl(selector).style.display = 'block';
}
  

  mask('#cardNumber', '____ ____ ____ ____');
  mask("#cvc", '___'); //?

  
}

function cvvValidator (selector) {
  let inputs = document.querySelectorAll('[data-validate="customer"]');
  inputs.forEach(input => {
    input.addEventListener('input', function () {
      if (isNaN(this.value)) {
        this.value = this.value.replace(/\d/, '');
        patterns.customerPattern = /^[a-zA-Z]+ [a-zA-Z]+?$/;
        messages.ru.customer.incorrect = 'Не верный формат. Имя Фамилия';
      } else {
        this.value = this.value.replace(/\D/, '').match(/[\w]{0,3}/);
        patterns.customerPattern = /^[0-9]{3,4}$/;
        messages.ru.customer.incorrect = 'Должно быть 3 симлова';
      }
    });
  })
}

window.onload = () => {
  myApp.baseGet(API_METHOD.getdetails, "")
    .then(responce => {
      let res = {
        amount: {
            amount: "0322",
            currency: "$",
            tax: 0
          },
        facilityData: {
            account: "0000000000",
            address: "Some address",
            email: "aws@gmail.com",
            iban: "UA  XX  XXXXXX  XXXXXXXXXXXXXXXXXXXX",
            initiator: "Ivan Petrov",
            initiatorId: 1,
            merchant: "Chudinov Yuri",
            merchantId: "31435110",
            phone: "380675556688"
          },
        tvc: 4444
      }
    paymentData = res;
      detectLanguage(navigator.languages[0].slice(0,2));
      fillCardForm();
      signInSuccess();
      initSubscription();
      welcome();
      cvvValidator('[data-validate="customer"]');
    });
}
