'use strict';

const defaultLanguage = "en";
// const BASE_URI = "https://localhost:5001";
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

const errorSpans = {
    verifyCode: document.getElementById("verify-code-error-span"),
    authorizedCustomer: document.getElementById("authorized-customer-error-span"),
    cards: document.getElementById("cards-error-span"),
    customer: document.getElementById("customer-error-span"),
    login: document.getElementById("login-error-span"),
    password: document.getElementById("password-error-span"),
    email: document.getElementById("email-error-span"),
};

let formState = {
    login: true,
    password: true,
    language: "",
    langClass: false
}

const ourLanguages = ["ru","en","sp"];

//variables
const holderNameRegexp = /^[a-zA-Z]+ [a-zA-Z]+?$/;
const cvvRegexp = /^[0-9]{3,4}$/;
const verifyCodeRegexp = /^[0-9]{2,4}$/;
const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]{2,5}$/;
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
            less: "Не меннее 3 символов",
        },
        login: {
            required: "Обязательное поле",
            less: "Не меннее 3 символов",
        },
        customer: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
        },
        verifyCode: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
        },
        authorizedCustomer: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
        },
        cards: {
            required: "Должно быть (3-4 цифры) или Имя(ie. Ivan Petrov)",
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
        facilitytitle: "Данные Мерчанта",
        initiatordetails: "сведения об инициаторе:",
        amount: "количество:",
        trantvc: "tran tvc:",
        paybycard: "Оплатить картой",
        paybycrypto: "Другой метод оплаты",
        cvvorholder: "CVV или имя держателя:",
        scancardbyemitter: "Сканировать карту",
        login: "логин",
        password: "пароль",
        rememberme: "Запомни меня",
        customer: "клиент:",
        card: "карта:",
        byconfirmyou: "Подтверждая, вы принимаете условия использования",
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
        emaillabel: "электронная почта:",
        completebutton: "Завершить",
        badthing: "Что-то пошло не так",
        closebutton: "Закрыть",
        scanning: "Сканирование",
        updatecard: "Обновить карту",
        choosewallet: "Выбрать кошелек",
        /////FACILITY DATA /////////////////////////
        initiatorId: "идентификатор",
        initiator: 'инициатор',
        merchant: 'мерчант',
        merchantId: 'id мерчанта',
        email: "имейл",
        phone: "телефон",
        account: "счет",
        address: 'адрес',
        iban: 'iban код',
        /////FACILITY DATA ///////////////////////// 
    },
    en: {
        language: "Language",
        mainlang: "EN",
        en: "EN",
        ru: "RU",
        sp: "ES",
        facilitytitle: "Merchant Data",
        initiatordetails: "initiator details:",
        amount: "amount:",
        trantvc: "tran tvc:",
        paybycard: "Pay by Card",
        paybycrypto: "Another Method",
        cvvorholder: "CVV or Holder Name:",
        scancardbyemitter: "Scan Card by Emitter",
        login: "login",
        password: "password",
        rememberme: "Remember me",
        customer: "customer:",
        card: "card:",
        byconfirmyou: "By Confirm you are accept service conditions",
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
        meinconteon: "me in Conteon",
        sendaninvitation: "We send an invitation mail with the link on mail above",
        emaillabel: "email:",
        completebutton: "Complete",
        badthing: "Bad thing happens",
        closebutton: "Close",
        scanning: "Scanning",
        updatecard: "Update Card",
        choosewallet: "Choose Wallet",
        /////FACILITY DATA /////////////////////////
        initiatorId: "initiatorId",
        initiator: 'initiator',
        merchant: 'merchant',
        merchantId: 'merchantId',
        email: "email",
        phone: "phone",
        account: "account",
        address: 'address',
        iban: 'iban',
        /////FACILITY DATA /////////////////////////
    },
    sp: {
        language: "Idioma",
        mainlang: "ES",
        en: "IN",
        ru: "RU",
        sp: "ES",
        facilitytitle: "Datos del Comerciante",
        initiatordetails: "detalles del iniciador:",
        amount: "Monto:",
        trantvc: "tran tvc:",
        paybycard: "Pagar con tarjeta",
        paybycrypto: "Otro método",
        cvvorholder: "CVV o nombre del titular:",
        scancardbyemitter: "Escanear tarjeta por emisor",
        login: "acceso",
        password: "contraseña",
        rememberme: "Recuérdame",
        customer: "cliente:",
        card: "tarjeta:",
        byconfirmyou: "Confirma que estás aceptado condiciones de servicio",
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
        meinconteon: "yo en Conteon",
        sendaninvitation: "Enviamos un correo de invitación con el enlace en el correo de arriba",
        emaillabel: "correo electrónico:",
        completebutton: "Completo",
        badthing: "Sucede algo malo",
        closebutton: "Cerrar",
        scanning: "Escaneo",
        updatecard: "Tarjeta de actualización",
        choosewallet: "Elija billetera",
        /////FACILITY DATA /////////////////////////
        initiatorId: "initiatorId",
        initiator: 'iniciador',
        merchant: 'comerciante',
        merchantId: 'comercianteId',
        email: "correo electrónico",
        phone: "teléfono",
        account: "cuenta",
        address: 'dirección',
        iban: 'iban',
        /////FACILITY DATA /////////////////////////
    }
};

function render(dictionary, lang) {
    for (const container of wordContainers) {
		if(container.dataset.langTag ==='scancardbyemitter'){
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

function translate(lang) {
    if (formState.language === lang) return;
    else render(dictionary[lang], lang);
}

function switcher(event) {
    event.stopPropagation();
    translate(event.target.dataset.lang);
    toggleLangList(event);
};


  /**
   * UI
   */
for (const lang of langContainers) {
    lang.addEventListener('click', switcher);
}
let myApp = {}
myApp.validation = {
  email: function(val) {
    if (val.length < 4) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].email.less,
            fieldSelector : 'email'
        }
      }
    }
    if (val.length > 100) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].email.more,
            fieldSelector : 'email'
        }
      }
    }
    if (emailPattern.test(val)) {
      return {
        status : 'S_OK',
        info : {
            code : '',
            message : '',
            fieldSelector : 'email'
        }
      }
    }
    if (!val.length) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].email.required,
            fieldSelector : 'email'
        }
      }
    }
    return {
      status : 'S_FAIL',
      info : {
          code : 3,
          message : messages[formState.language].login.incorrect,
          fieldSelector : 'email'
      }
    }
  },
  login: function(val) {
    if (!val.length) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].login.required,
            fieldSelector : 'login'
        }
      }
    }
    if (val.length < 3) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].login.less,
            fieldSelector : 'login'
        }
      }
    }
    return {
      status : 'S_OK',
      info : {
          code : '',
          message : '',
          fieldSelector : 'login'
      }
    }
  },
  password: function(val) {
    if (!val.length) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].password.required,
            fieldSelector : 'password'
        }
      }
    }
    if (val.length < 3) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].password.less,
            fieldSelector : 'password'
        }
      }
    }
    return {
      status : 'S_OK',
      info : {
          code : '',
          message : '',
          fieldSelector : 'password'
      }
    };
  },
  customer: function(val) {
    if (!cvvRegexp.test(val) && !holderNameRegexp.test(val)) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].customer.required,
            fieldSelector : 'customer'
        }
      }
    }
    return {
      status : 'S_OK',
      info : {
          code : '',
          message : '',
          fieldSelector : 'customer'
      }
    }
  },
  verify_code: function(val) {
    if (!verifyCodeRegexp.test(val)) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].verifyCode.required,
            fieldSelector : 'verify_code'
        }
      }
    }
    return {
      status : 'S_OK',
      info : {
          code : '',
          message : '',
          fieldSelector : 'verify_code'
      }
    }
  },
  authorized_customer: function(val) {
    if (!holderNameRegexp.test(val)) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].authorizedCustomer.required,
            fieldSelector : 'authorized_customer'
        }
      }
    }
    return {
      status : 'S_OK',
      info : {
          code : '',
          message : '',
          fieldSelector : 'authorized_customer'
      }
    }
  },
  cards: function(val) {
    if (!val.length) {
      return {
        status : 'S_FAIL',
        info : {
            code : 3,
            message : messages[formState.language].cards.required,
            fieldSelector : 'cards'
        }
      }
    }
    return {
      status : 'S_OK',
      info : {
          code : '',
          message : '',
          fieldSelector : 'cards'
      }
    }
  }
};
myApp.baseGet = function (url, content = '', isText = false) {

  const params = typeof content === 'string' ? content : JSON.stringify(content);
  const contentType = typeof content === 'string' ? 'plain/text' : 'application/json';

  return new Promise((resolve, reject) => {
    setTimeout(()=> {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", `${BASE_URI}${API_PREFIX}${url}/${params}`);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.onload = () => resolve(isText ? xhr.responseText : JSON.parse(xhr.responseText));
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
    }, 0)
    });
}

  //#region Base methods
  // request
function basePost(url, content, isText = false) {
    const contentType = typeof content === 'string' ? 'plain/text' : 'application/json';
    const body = typeof content === 'string' ? content : JSON.stringify(content);

    return new Promise((resolve, reject) => {
      setTimeout(()=> {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `${BASE_URI}${API_PREFIX}${url}`);
          xhr.setRequestHeader('Content-Type', contentType);
          xhr.onload = () => resolve(isText ? xhr.responseText : JSON.parse(xhr.responseText));
          xhr.onerror = () => reject(xhr.statusText);
          xhr.send(body);
        }, 0)
      });
}

function baseGet(url, content = '', isText = false) {

    const params = typeof content === 'string' ? content : JSON.stringify(content);
    const contentType = typeof content === 'string' ? 'plain/text' : 'application/json';

    return new Promise((resolve, reject) => {
      setTimeout(()=> {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `${BASE_URI}${API_PREFIX}${url}/${params}`);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.onload = () => resolve(isText ? xhr.responseText : JSON.parse(xhr.responseText));
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
      }, 0)
        
      });
}

//scanCard Validation
function scanCardFieldSource () {
  return new Promise((resolve, reject) => {
    
    const customerInput = getFormEl('customer');
    const customerInputValidate = myApp.validation.customer(customerInput.value);
  
    if (customerInputValidate.status == 'S_OK') {
      resolve({
        validInfo: {
          status: 'S_OK',
          validFieldsInfo: [customerInputValidate]
        },
          data: customerInput.value
        }
      );
    } else {
      reject({
        validInfo: {
          status: 'S_FAIL',
          validFieldsInfo: [customerInputValidate]
        }
      });
    }
  })
}
//scanCard Data
function scanCardPromise (datasource) {
  return new Promise((resolve, reject) => {
    datasource.then(res => {
      if (res.validInfo.status == 'S_FAIL') {
        reject(res)
      } else {
          if (res == 'cvv') {
            resolve({
              validInfo: res.validInfo,
              data: {
                customer: "cvv",
                tokenName: "34*21***34",
                tokenValue: "MzQqMjEqKiozNC4xMTE="
              }
            })
          } else {
            resolve({
              validInfo: res.validInfo,
              data: {
                customer: "YANA STR",
                tokenName: "34*21***34",
                tokenValue: "MzQqMjEqKiozNC5ZQU5BIFNUUg=="
              }
            })
          }
      }
    }).catch(err => reject(err))
  })
}
//scanCard UI
function scanCard() {
  const customerInput = getFormEl('customer');
  const scanButton = getFormEl('scanCard');
  const cardNumber = document.getElementById('cardNumber');
  
  scanButton.innerText = dictionary[formState.language].scanning;
  scanButton.toggleAttribute('disabled');
  customerInput.classList.remove(errorClasses.input);
  removeSpanErrorStyles(customerInput.id, "")

  scanCardPromise(scanCardFieldSource())
    .then(({validInfo, data}) => {
      customerInput.value = data.customer;
      cardNumber.innerText = data.tokenName;
      validInfo.validFieldsInfo.forEach(item => {
        removeErrorUI(item.info);
      })
    })
    .catch(err => {
      err.validInfo.validFieldsInfo.forEach(item => {
        setErrorUI(item.info);
      })
    })
    .finally(()=>{
      setFormState(true, 'customer');
      scanButton.toggleAttribute('disabled');
      scanButton.textContent ='Обновить карту';	  
    });
}


//#endregion

function detectLanguage(lang) {
    const stLang = localStorage.getItem("language");
    if (stLang !== null) {
        translate(stLang);
    } else {
      const index = ourLanguages.findIndex(e => e === lang);
      index === -1 ? translate(defaultLanguage) : translate(lang);
    }
}

  // init
window.onload = () => {
  detectLanguage(navigator.languages[0].slice(0,2));
  fillCardForm();
  signInSuccess();
  initSubscription();
}

  // subscription
function initSubscription() {
    getFormEl('byCard').addEventListener('change', () => {
      togglePaymentMethod();
      togglePaymentTypeForm();
      disableSubmit();

      if (hasCard) {
      enableSubmit();
      }
    });

    getFormEl('byCrypto').addEventListener('change', () => {
      togglePaymentMethod();
      togglePaymentTypeForm();
      disableSubmit();

      if (authorizedUser) {
        enableSubmit();
      }
    });

    getFormEl('scanCard').addEventListener('click', () => scanCard());
    getFormEl('signIn').addEventListener('click', () => signIn());
    getFormEl('submitButton').addEventListener('click', () => onFormSubmit());
    document.getElementById('merchantHeader').addEventListener('click', () => toggleExpand());
    document.getElementById('registerUser')
        .addEventListener('change', () => document.getElementById('emailContainer').toggleAttribute('hidden'));
    document.querySelectorAll('.checkbox')
        .forEach(item => item.addEventListener('change', () => item.toggleAttribute('checked')));
  }

  function togglePaymentMethod() {
    getFormEl('byCard').toggleAttribute('checked');
    getFormEl('byCrypto').toggleAttribute('checked');
  }

  function toggleExpand() {
    document.getElementById('merchantHeader').classList.toggle('expand');
  }

    function toggleLangList(event) {
        const langList = document.getElementById('lang-list');
        event.stopPropagation();
        if(!formState.langClass){
            langList.classList.add("dsp-block");
            setFormState(true, "langClass");
            return;
        }
        if(formState.langClass)  {
            langList.classList.remove("dsp-block");
            setFormState(false, "langClass");
            return;
        } 
    }
   function abortClickOnParent(event) {
       event.stopPropagation();
   }

  function setErrorUI ({code, message, fieldSelector}) {
    const input = getFormEl(fieldSelector);
    input.classList.add(errorClasses.input);
    addSpanErrorStyles(fieldSelector, message);
    setFormState(false, fieldSelector);
  }
  
  function removeErrorUI ({code, message, fieldSelector}) {
    const input = getFormEl(fieldSelector);
    input.classList.remove(errorClasses.input);
    removeSpanErrorStyles(fieldSelector, message);
    setFormState(true, fieldSelector);
  }

  function fillCardForm(response) {
    let data = response || localStorage.getItem(`ctr-${paymentData.facilityData.merchantId}-token`);

    if (data) {
      hasCard = true;
    basePost(API_METHOD.unpackdata, {"value": data})
      .then((payload) => {
        console.log(payload);
        getFormEl('scanCard').innerText = dictionary[formState.language].updatecard;
        document.getElementById('cardNumber').innerText = payload.tokenName;
        getFormEl('customer').value = payload.customer;
        getFormEl('cardToken').value = payload.tokenValue;
        enableSubmit();
        _cardToken = payload;
      });
    }
  }

  function signInSource () {
    return new Promise((resolve, reject) => {
      
      const loginInput = getFormEl('login');
      const passwordInput = getFormEl('password');
      const loginValidate = myApp.validation.login(loginInput.value);
      const passwordValidate = myApp.validation.password(passwordInput.value);
      if (loginValidate.status == 'S_OK' && passwordValidate.status == 'S_OK') {
        resolve({
          validInfo: {
            status: 'S_OK',
            validFieldsInfo: [loginValidate, passwordValidate]
          },
          data: {
            login: getFormEl('login').value,
            password: getFormEl('password').value,
          }
        }
        );
      } else {
        reject({
          validInfo: {
            status: 'S_FAIL',
            validFieldsInfo: [loginValidate, passwordValidate]
          }
        });
      }
    })
  }
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
    signInPromise(signInSource())
    .then(({validInfo, data}) => {
      validInfo.validFieldsInfo.forEach(item => {
        removeErrorUI(item.info);
      })
      loginToken = data;
      signInSuccess(data);
      setFormState("customer", data.customer);
      enableSubmit();
    }).catch(err => {
      err.validInfo.validFieldsInfo.forEach(item => {
        setErrorUI(item.info);
      })
    })
  }


  function signInSuccessPromise (response) {
    return new Promise((resolve, reject) => {
      if (getFormEl('rememberMe').checked && !localStorage.getItem('ctn-auth-data')) {
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
    getFormEl('authorizedCustomer').value = data.customer;
    fillOptions(data.methods);
  }

  function fillOptions(data) {
    const select = getFormEl('cards');
    data.forEach(item => {
      const option = document.createElement('option');
      option.innerText = item.tokenName;
      option.value = item.tokenValue;
      select.appendChild(option);
    });
  }

  // submit action
  function onFormSubmit() {
    const dealData = buildDeal();
    const response = false;
    let requiredFields = getFormEl('byCard').checked
        ? ['verifyCode', 'customer'] : ['verifyCode', 'authorizedCustomer', 'cards'];

    if (getFormEl('byCard').checked && getFormEl('customer').value.toLowerCase() === 'cvv') {
      requiredFields = requiredFields.filter(item => item !== 'customer');
    }

    if (!myApp.validation.form(requiredFields)) {
      return;
    }

	basePost(API_METHOD.accept, dealData, true).then(payload => {

		document.getElementById('formContainer').setAttribute('hidden', 'true');

		if (payload != null || payload.status === 'S_OK') {                    
			initSuccessPage();
		} else {
			payload = JSON.parse(payload);
			errorPayload.Code = payload.internalCode;
			errorPayload.Text = payload.status;
			initErrorPage();
		}
	});
  }

  function initSuccessPage() {
    document.getElementById('formContainer').setAttribute('hidden', 'true');
    document.getElementById('successContainer').removeAttribute('hidden');
    document.getElementById('completePayment').addEventListener('click', () => onCompletePayment());
  }

  function initErrorPage() {
    document.getElementById('formContainer').setAttribute('hidden', 'true');
    document.getElementById('errorMessage').innerText = `Error: ${errorPayload.Text}`;
    document.getElementById('errorContainer').removeAttribute('hidden');
  }

  function onCompletePayment() {
    const emailInput = document.getElementById('email');

    if (document.getElementById('rememberCard').checked ) {
      rememberCardToken();
    }

    if (document.getElementById('registerUser').checked) {
      const emailError = validateFields("email", emailInput.value);
      if (emailError !== "") {
        emailInput.classList.add(errorClasses.input);
        addSpanErrorStyles("email", emailError);
        return;
      } else {
        emailInput.classList.remove(errorClasses.input);
        removeSpanErrorStyles("email", "")
      }
    }

    exportFile(API_METHOD.export)
        .then(payload => {
          const data = {
            registerMe: document.getElementById('registerUser').checked,
            email: emailInput.value || null
          };
          downloadFile(payload);

          basePost(API_METHOD.completeSession, data)
              .then(response => {
                window.location = "http://ledger.conteon.io";
              })
        });
        localStorage.setItem("language", formState.language)
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
    if (getFormEl('byCrypto').checked) {
      const cards =  getFormEl('cards');
      const option = cards.options[cards.options.selectedIndex];  
      const data = {
        tokenName: option.textContent,
        tokenValue: option.value,
        customer: getFormEl('authorizedCustomer').value
      };
      basePost(API_METHOD.packdata, data, true).then(payload => {
        localStorage.setItem(keyName, payload);
      });
      return;
    }
      
    if (getFormEl('byCard').checked) {
      basePost(API_METHOD.packdata, _cardToken, true)
          .then(payload => {
            localStorage.setItem(keyName, payload);
          });
      }
  }

  function buildDeal() {
    let payload;

    if (getFormEl('byCard').checked) {
      payload = _cardToken;
    } else {
      payload = {
        "customer": getFormEl('authorizedCustomer').value,
        "token": getFormEl('cards').value
      };
    }

    return payload;
  }


  // api
  //validation



  // CHANGE FORM STATE
  function setFormState(state, inputName) {
    const prewState = {...formState};
    prewState[inputName] = state;
    const newState = {...prewState};
    return formState = {...newState};
  }
  // CHANGE FORM STATE

  // TOGGLE ERROR STYLES ON SPANS
  function addSpanErrorStyles(elementId, error) {
    const element = errorSpans[elementId];
    element.classList.add(errorClasses.span);
    element.textContent = error;
  }

  // TOGGLE ERROR STYLES ON SPANS
  function removeSpanErrorStyles(elementId, error) {
    const element = errorSpans[elementId];
    element.classList.remove(errorClasses.span);
    element.textContent = error;
  }

// form methods and get elements methods
function togglePaymentTypeForm() {
    [document.getElementById('formCard'), document.getElementById('formByCrypto')]
        .forEach(element => element.toggleAttribute('hidden'));
}

function toggleAuthForm() {
    [document.getElementById('formSignIn'), document.getElementById('authorizedForm')]
    .forEach(element => element.toggleAttribute('hidden'));
}

function disableSubmit() {
  const button = document.getElementById('submitButton');
  button.disabled = true;
}

function enableSubmit() {
    const button = document.getElementById('submitButton');
    button.disabled = false;
}

function getFormEl(name) {
    return document.forms[0][name];
}

function _dById(name) {
    document.getElementById(name);
}

async function renderFacilityData() {
    const facilityData = document.getElementById("merchantData");
    const initiator = document.getElementById("initiator");
    const amount = document.getElementById("amount");
    const verifyCode = document.getElementById("verifyCode");
    let html = ""

    Object.entries(paymentData.facilityData)
        .filter(([key]) => key !== 'initiator')
        .forEach(([key, value]) => {
            const translatedTitleText = dictionary[formState.language][key];
            const title = `<span data-lang-tag="${key}">${translatedTitleText.toUpperCase()}:</span>`;
            const data = `<span class="data">${value}</span>`;
            html += `<p>${title} ${data}</p>`;
        });

    facilityData.innerHTML = html;
    initiator.value = paymentData.facilityData.initiator;
    amount.value = paymentData.amount.currency + paymentData.amount.amount;
    verifyCode.value = paymentData.tvc;
}

  // MODAL
  const modal = document.getElementById("myModal");
  const btn = document.getElementById("myBtn");
 
  btn.onclick = function () {
	if(!agreementHasLoaded) {
		baseGet(API_METHOD.getAgreement, formState.language, true)
			.then(responce => {
				modal.innerHTML = responce
				const closeBtn = document.getElementById("modalCloseBtn");
				closeBtn.onclick = function () {
				  modal.style.display = "none";
				}
				
				agreementHasLoaded = true;
			});
		}
    modal.style.display = "block";
  }
