import './style.css';
import './app.css';
import * as Realm from 'realm-web';

import logo from './assets/images/combat-coating-icon.jpg';
import logoPen from './assets/images/pen-icon.png';
import { InfoDialog } from '../wailsjs/go/main/App';
import { ErrorDialog } from '../wailsjs/go/main/App';
import { WarningDialog } from '../wailsjs/go/main/App';

// Constructors
const {
    BSON: { ObjectId },
} = Realm;

// Code
loadPageLogin();

function loadPageLogin() {
    document.getElementById('app').innerHTML = `
    <img id="logo" class="logo--l">
    <div>
      <p>Combat Coating (M) Sdn Bhd</p>
      <p>Automotive Parts Tracking System</p>
    </div>
    <div class="login" id="login">
      <div class="input-area">
        <div class="input-box">
          <p class="attribute">Email :</p>
          <input class="input" id="email" type="text" autocomplete="off"/>
        </div>
    	  <div class="input-box">
          <p class="attribute">Password :</p>
          <input class="input" id="password" type="password" autocomplete="off" />
        </div>
      </div>
      <p class="loading" id="loading">Loading.</p>
      <p class="error" id="error">Incorrect email or password.</p>
      <div class="choice-area">
        <button class="btn" id="btnLogin" onclick="login()">Login</button>
        <p class="resetPw" onclick="resetPassword()" style="display:none">Forget Password</p>
      </div>
    </div>
  `;

    document.getElementById('logo').src = logo;
    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');
    const errorElement = document.getElementById('error');
    const loadingElement = document.getElementById('loading');
    let errorTimeout;

    emailElement.focus();

    window.login = async function () {
        try {
            // Authenticate user + connect db.
            let tempResult;
            // const email = emailElement.value;
            // const password = passwordElement.value;
            // const email = 'xuanyuong@gmail.com'; // Debug use, remove in production.
            // const password = 'Oyxnuugan11'; // Debug use, remove in production.
            const email = 'testAdmin'; // Debug use, remove in production.
            const password = 'testAdmin'; // Debug use, remove in production.
            const credentials = Realm.Credentials.emailPassword(email, password);
            const appMongoId = 'cc-jlzohds';
            const appMongo = new Realm.App({ id: appMongoId });
            try {
                clearTimeout(errorTimeout);
                errorElement.style.display = 'none';
                loadingElement.style.display = 'block';
                tempResult = await appMongo.logIn(credentials);
            } catch (err) {
                loadingElement.style.display = 'none';
                errorElement.style.display = 'block';
                errorTimeout = setTimeout(() => {
                    errorElement.style.display = 'none';
                }, 3000);
                return;
            }
            const user = tempResult;
            tempResult = undefined;
            const clusterName = 'cc-desktop-app';
            const dbName = 'todo';
            try {
                const mongo = appMongo.currentUser.mongoClient(clusterName);
                tempResult = mongo.db(dbName);
            } catch (err) {
                throw err;
            }
            const dbMongo = tempResult;
            tempResult = undefined;

            // Determine logged-in user's system role (access rights).
            try {
                const result = await dbMongo
                    .collection('User_Role')
                    .findOne({ user_id: ObjectId(appMongo.currentUser.id) });
                tempResult = result['role'];
            } catch (err) {
                throw err;
            }
            const role = tempResult;
            tempResult = undefined;

            // Navigate to home page.
            await loadPageHome(user, role, appMongo, dbMongo);
        } catch (err) {
            ErrorDialog(err.message);
        }
    };

    window.resetPassword = function () {
        // Code block
    };
}

async function loadPageHome(user, role, appMongo, dbMongo) {
    // Hide html before data is loaded.
    document.getElementById('app').style.display = 'none';
    document.getElementById('app').innerHTML = `
    <p class="logout" id="logout" onclick="logout()">Log Out</p>
    <img id="logo" class="logo--l">
    <div>
      <p>Combat Coating (M) Sdn Bhd</p>
      <p>Automotive Parts Tracking System</p>
    </div>
    <div class="home">
      <button class="btn" id="btnRegister" onclick="loadPageRegister()">Register</button>
      <button class="btn" id="btnDashboard" onclick="loadPageDashboard()">Dashboard</button>
      <button class="btn" id="btnSearch" onclick="loadPageSearch()">Search</button>
      <button class="btn" id="btnSettings" onclick="loadPageSettings()">Settings</button>
    </div>
  `;

    document.getElementById('logo').src = logo;
    const registerElement = document.getElementById('btnRegister');
    const dashboardElement = document.getElementById('btnDashboard');
    const settingsElement = document.getElementById('btnSettings');

    // Show different options depending on the current logged-in user's role.
    if (role === 'data_entry_worker') {
        registerElement.style.display = 'inline-block';
    } else if (role === 'admin') {
        dashboardElement.style.display = 'inline-block';
        settingsElement.style.display = 'inline-block';
    }

    // Display page after data has loaded.
    document.getElementById('app').style.display = 'block';

    window.loadPageRegister = () => loadPageRegister(user, role, appMongo, dbMongo);

    window.loadPageDashboard = () => loadPageDashboard(user, role, appMongo, dbMongo);

    window.loadPageSearch = () => loadPageSearch(user, role, appMongo, dbMongo);

    window.loadPageSettings = () => loadPageSettings(user, role, appMongo, dbMongo);

    window.logout = () => logOut(appMongo);
}

function loadPageRegister(user, role, appMongo, dbMongo) {
    function pageRegister() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Register Page</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Customer :</p>
                        <input class="input--s" id="customer" type="text" autocomplete="off" disabled />
                        <button class="btn-s" id="btnCustomer" onclick="customerSelection()">O</button>
                    </div>
                        <div class="input-box">
                        <p class="attribute">Supplier :</p>
                        <input class="input--s" id="supplier" type="text" autocomplete="off" disabled />
                        <button class="btn-s" id="btnSupplier" onclick="supplierSelection()">O</button>
                    </div>
                    <div class="input-box">
                        <p class="attribute">Part :</p>
                        <input class="input--s" id="part" type="text" autocomplete="off" disabled />
                        <button class="btn-s" id="btnPart" onclick="partSelection()">O</button>
                    </div>
                    <div class="input-box">
                        <p class="attribute">Color :</p>
                        <input class="input--s" id="color" type="text" autocomplete="off" disabled />
                        <button class="btn-s" id="btnColor" onclick="colorSelection()">O</button>
                    </div>
                    <div class="input-box">
                        <p class="attribute">Delivery Incoming :</p>
                        <input class="input--l" id="deliveryIncoming" type="datetime-local" style="font-family: Arial, Helvetica, sans-serif" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Quantity :</p>
                        <input class="input--l" id="quantity" type="number" min="1" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="register()">Register</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;
        const elementCustomer = document.getElementById('customer');
        elementCustomer.value = customerName;
        const elementSupplier = document.getElementById('supplier');
        elementSupplier.value = supplierName;
        const elementPart = document.getElementById('part');
        elementPart.value = partName;
        const elementColor = document.getElementById('color');
        elementColor.value = colorCode.join(', ');
        const elementQuantity = document.getElementById('quantity');
        elementQuantity.value = quantity;
        const elementDeliveryIncoming = document.getElementById('deliveryIncoming');
        elementDeliveryIncoming.value = deliveryIncoming;

        elementDeliveryIncoming.addEventListener('input', function (event) {
            deliveryIncoming = elementDeliveryIncoming.value;
        });

        elementQuantity.addEventListener('input', function (event) {
            quantity = elementQuantity.value;
        });

        window.customerSelection = () => customerSelection();

        window.supplierSelection = () => supplierSelection();

        window.partSelection = () => partSelection();

        window.colorSelection = () => colorSelection();

        window.returnPage = async function () {
            // Warn user if any of the fields are filled.
            const inputFields = [elementCustomer, elementSupplier, elementPart, elementColor];
            const isFilled = inputFields.every((inputField) => inputField.value === '');
            if ((isFilled && deliveryIncoming === '') === false) {
                const result = await WarningDialog('Confirm', 'Discard changes?');
                if (result !== true) {
                    return;
                }
            }

            // Navigate to home page.
            loadPageHome(user, role, appMongo, dbMongo);
        };

        window.logout = () => logOut(appMongo);
    }

    // Load page.
    let partId = '';
    let partName = '';
    let customerId = '';
    let customerName = '';
    let supplierId = '';
    let supplierName = '';
    let colorId = [];
    let colorCode = [];
    let deliveryIncoming = '';
    let quantity = 1;
    pageRegister();

    async function customerSelection() {
        window.customerRegistration = () => customerRegistration();
        window.returnRegisterPage = () => pageRegister();
        window.logout = () => logOut(appMongo);

        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnRegisterPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Customer Selection</p>
            <div class="searchResult">
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="customerRegistration()">New</button>
                </div>
                <div class="resultTable">
                    <table id='table'>
                        <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Contact No</th>
                            <th>Address</th>
                            <th>Postcode</th>
                            <th>Area</th>
                            <th>State</th>
                            <th>Country</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;
        const tableElement = document.getElementById('table');

        let tempResult;
        try {
            tempResult = await dbMongo.collection('Customer').find({});
            const tableBodyElement = tableElement.getElementsByTagName('tbody')[0];
            for (const customer of tempResult) {
                const row = tableBodyElement.insertRow();
                const keys = ['Customer_Name', 'Contact_Name', 'Address', 'Postcode', 'Area', 'State', 'Country'];
                keys.forEach((key, index) => {
                    const cell = row.insertCell(index);
                    if (customer[key] !== undefined) {
                        let value = customer[key];
                        cell.innerHTML = value;
                    } else {
                        cell.innerHTML = '-';
                    }
                });

                // Add 'selected' class to previously selected row.
                if (customer['_id'].equals(customerId)) {
                    row.classList.add('selected');
                }
            }
        } catch (err) {
            await ErrorDialog(err.message);
            pageRegister();
        }
        const customers = tempResult;
        tempResult = undefined;

        tableElement.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement;
                const rowIndex = row.rowIndex - 1;
                customerId = customers[rowIndex]['_id'];
                customerName = customers[rowIndex]['Customer_Name'];

                // Remove 'selected' class from any previously selected row.
                const selectedRows = tableElement.getElementsByClassName('selected');
                while (selectedRows.length > 0) {
                    selectedRows[0].classList.remove('selected');
                }

                // Add 'selected' class to selected row.
                row.classList.add('selected');
            }
        });
    }

    async function customerRegistration() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Customer Registration</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Customer Name :</p>
                        <input class="input--l" id="name" type="text" autocomplete="off" />
                    </div>
                        <div class="input-box">
                        <p class="attribute">Contact Number :</p>
                        <input class="input--l" id="contact" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Address :</p>
                        <input class="input--l" id="address" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Postcode :</p>
                        <input class="input--l" id="postcode" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Area :</p>
                        <input class="input--l" id="area" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">State :</p>
                        <input class="input--l" id="state" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Country :</p>
                        <input class="input--l" id="country" type="text" autocomplete="off" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;

        window.save = async function () {
            const name = document.getElementById('name').value;
            const contact = document.getElementById('contact').value;
            const address = document.getElementById('address').value;
            const postcode = document.getElementById('postcode').value;
            const area = document.getElementById('area').value;
            const state = document.getElementById('state').value;
            const country = document.getElementById('country').value;

            // Prompt error if not all fields are filled.
            const inputFields = [name, contact, address, postcode, area, state, country];
            const isFilled = inputFields.every((inputField) => inputField !== '');
            if (isFilled === false) {
                // Display error messages.
                if (name === '') {
                    // Code block
                }
                if (contact === '') {
                    // Code block
                }
                if (address === '') {
                    // Code block
                }
                if (postcode === '') {
                    // Code block
                }
                if (area === '') {
                    // Code block
                }
                if (state === '') {
                    // Code block
                }
                if (country === '') {
                    // Code block
                }

                await ErrorDialog('Not all fields filled.');
                return;
            }

            // Insert new record to db.
            try {
                await dbMongo.collection('Customer').insertOne({
                    Customer_Name: name,
                    Contact_Number: contact,
                    Address: address,
                    Postcode: postcode,
                    Area: area,
                    State: state,
                    Country: country,
                });
            } catch (err) {
                await ErrorDialog(err.message);
            }

            customerSelection();
        };

        window.returnPage = () => customerSelection();
        window.logout = () => logOut(appMongo);
    }

    async function supplierSelection() {
        window.supplierRegistration = () => supplierRegistration();
        window.returnRegisterPage = () => pageRegister();
        window.logout = () => logOut(appMongo);

        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnRegisterPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Supplier Selection</p>
            <div class="searchResult">
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="supplierRegistration()">New</button>
                </div>
                <div class="resultTable">
                    <table id='table'>
                        <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Contact No</th>
                            <th>Address</th>
                            <th>Postcode</th>
                            <th>Area</th>
                            <th>State</th>
                            <th>Country</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
            `;

        document.getElementById('logo').src = logo;
        const tableElement = document.getElementById('table');

        let tempResult;
        try {
            tempResult = await dbMongo.collection('Supplier').find({});
            const tableBodyElement = tableElement.getElementsByTagName('tbody')[0];
            for (const supplier of tempResult) {
                const row = tableBodyElement.insertRow();
                const keys = ['Supplier_Name', 'Contact_Name', 'Address', 'Postcode', 'Area', 'State', 'Country'];
                keys.forEach((key, index) => {
                    const cell = row.insertCell(index);
                    if (supplier[key] !== undefined) {
                        let value = supplier[key];
                        cell.innerHTML = value;
                    } else {
                        cell.innerHTML = '-';
                    }
                });

                // Add 'selected' class to previously selected row.
                if (supplier['_id'].equals(supplierId)) {
                    row.classList.add('selected');
                }
            }
        } catch (err) {
            await ErrorDialog(err.message);
            pageRegister();
        }
        const suppliers = tempResult;
        tempResult = undefined;

        tableElement.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement;
                const rowIndex = row.rowIndex - 1;
                supplierId = suppliers[rowIndex]['_id'];
                supplierName = suppliers[rowIndex]['Supplier_Name'];

                // Remove 'selected' class from any previously selected row.
                const selectedRows = tableElement.getElementsByClassName('selected');
                while (selectedRows.length > 0) {
                    selectedRows[0].classList.remove('selected');
                }

                // Add 'selected' class to selected row.
                row.classList.add('selected');
            }
        });
    }

    async function supplierRegistration() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Supplier Registration</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Supplier Name :</p>
                        <input class="input--l" id="name" type="text" autocomplete="off" />
                    </div>
                        <div class="input-box">
                        <p class="attribute">Contact Number :</p>
                        <input class="input--l" id="contact" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Address :</p>
                        <input class="input--l" id="address" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Postcode :</p>
                        <input class="input--l" id="postcode" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Area :</p>
                        <input class="input--l" id="area" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">State :</p>
                        <input class="input--l" id="state" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Country :</p>
                        <input class="input--l" id="country" type="text" autocomplete="off" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;

        window.save = async function () {
            const name = document.getElementById('name').value;
            const contact = document.getElementById('contact').value;
            const address = document.getElementById('address').value;
            const postcode = document.getElementById('postcode').value;
            const area = document.getElementById('area').value;
            const state = document.getElementById('state').value;
            const country = document.getElementById('country').value;

            // Prompt error if not all fields are filled.
            const inputFields = [name, contact, address, area, postcode, state, country];
            const isFilled = inputFields.every((inputField) => inputField !== '');
            if (isFilled === false) {
                // Display error messages.
                if (name === '') {
                    // Code block
                }
                if (contact === '') {
                    // Code block
                }
                if (address === '') {
                    // Code block
                }
                if (postcode === '') {
                    // Code block
                }
                if (area === '') {
                    // Code block
                }
                if (state === '') {
                    // Code block
                }
                if (country === '') {
                    // Code block
                }

                await ErrorDialog('Not all fields filled.');
                return;
            }

            // Insert new record to db.
            try {
                await dbMongo.collection('Supplier').insertOne({
                    Supplier_Name: name,
                    Contact_Number: contact,
                    Address: address,
                    Area: area,
                    Postcode: postcode,
                    State: state,
                    Country: country,
                });
            } catch (err) {
                await ErrorDialog(err.message);
            }

            supplierSelection();
        };

        window.returnPage = () => supplierSelection();
        window.logout = () => logOut(appMongo);
    }

    async function partSelection() {
        window.partRegistration = () => partRegistration();
        window.returnRegisterPage = () => pageRegister();
        window.logout = () => logOut(appMongo);

        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnRegisterPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Part Selection</p>
            <div class="searchResult">
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="partRegistration()">New</button>
                </div>
                <div class="resultTable">
                    <table id='table'>
                        <thead>
                        <tr>
                            <th>Part Name</th>
                            <th>Model</th>
                            <th>Brand</th>
                            <th>Model Creation Year</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
            `;

        document.getElementById('logo').src = logo;
        const tableElement = document.getElementById('table');

        let tempResult;
        try {
            tempResult = await dbMongo.collection('Part').find({});
            const tableBodyElement = tableElement.getElementsByTagName('tbody')[0];
            for (const part of tempResult) {
                const row = tableBodyElement.insertRow();
                const keys = ['Part_Name', 'Model', 'Brand', 'Year'];
                keys.forEach((key, index) => {
                    const cell = row.insertCell(index);
                    if (part[key] !== undefined) {
                        let value = part[key];
                        cell.innerHTML = value;
                    } else {
                        cell.innerHTML = '-';
                    }
                });

                // Add 'selected' class to previously selected row.
                if (part['_id'].equals(partId)) {
                    row.classList.add('selected');
                }
            }
        } catch (err) {
            await ErrorDialog(err.message);
            pageRegister();
        }
        const parts = tempResult;
        tempResult = undefined;

        tableElement.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement;
                const rowIndex = row.rowIndex - 1;
                partId = parts[rowIndex]['_id'];
                partName = parts[rowIndex]['Part_Name'];

                // Remove 'selected' class from any previously selected row.
                const selectedRows = tableElement.getElementsByClassName('selected');
                while (selectedRows.length > 0) {
                    selectedRows[0].classList.remove('selected');
                }

                // Add 'selected' class to selected row.
                row.classList.add('selected');
            }
        });
    }

    async function partRegistration() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Part Registration</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Part Name :</p>
                        <input class="input--l" id="name" type="text" autocomplete="off" />
                    </div>
                        <div class="input-box">
                        <p class="attribute">Model :</p>
                        <input class="input--l" id="model" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Brand :</p>
                        <input class="input--l" id="brand" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Year :</p>
                        <input class="input--l" id="year" type="number" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;

        window.save = async function () {
            const name = document.getElementById('name').value;
            const model = document.getElementById('model').value;
            const brand = document.getElementById('brand').value;
            const year = Number(document.getElementById('year').value);

            // Prompt error if not all fields are filled.
            const inputFields = [name, model, brand];
            const isFilled = inputFields.every((inputField) => inputField !== '');
            if ((isFilled && year !== 0) === false) {
                // Display error messages.
                if (name === '') {
                    // Code block
                }
                if (model === '') {
                    // Code block
                }
                if (brand === '') {
                    // Code block
                }
                if (year === 0) {
                    // Code block
                }

                await ErrorDialog('Not all fields filled.');
                return;
            }

            // Insert new record to db.
            try {
                await dbMongo.collection('Part').insertOne({
                    Part_Name: name,
                    Model: model,
                    Brand: brand,
                    Year: year,
                });
            } catch (err) {
                await ErrorDialog(err.message);
            }

            partSelection();
        };

        window.returnPage = () => partSelection();
        window.logout = () => logOut(appMongo);
    }

    async function colorSelection() {
        window.colorRegistration = () => colorRegistration();
        window.returnRegisterPage = () => pageRegister();
        window.logout = () => logOut(appMongo);

        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnRegisterPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Colors Selection</p>
            <div class="searchResult">
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="colorRegistration()">New</button>
                </div>
                <div class="resultTable">
                    <table id='table'>
                        <thead>
                        <tr>
                            <th>Color Code</th>
                            <th>Color Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
            `;

        document.getElementById('logo').src = logo;
        const tableElement = document.getElementById('table');

        let tempResult;
        try {
            tempResult = await dbMongo.collection('Color').find({});
            const tableBodyElement = tableElement.getElementsByTagName('tbody')[0];
            for (const color of tempResult) {
                const row = tableBodyElement.insertRow();
                const keys = ['Color_Code', 'Color_Name'];
                keys.forEach((key, index) => {
                    const cell = row.insertCell(index);
                    if (color[key] !== undefined) {
                        let value = color[key];
                        cell.innerHTML = value;
                    } else {
                        cell.innerHTML = '-';
                    }
                });

                // Add 'selected' class to previously selected row.
                for (const id of colorId) {
                    if (color['_id'].equals(id)) {
                        row.classList.add('selected');
                    }
                }
            }
        } catch (err) {
            await ErrorDialog(err.message);
            pageRegister();
        }
        const colors = tempResult;
        tempResult = undefined;

        tableElement.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement;
                const rowIndex = row.rowIndex - 1;
                const selectedColorId = colors[rowIndex]['_id'];

                // Check if clicked row was previously selected.
                const isSelected = row.className.match('(^|\\s+)selected(\\s+|$)');

                if (isSelected) {
                    // Remove selection if clicked row was previously selected.
                    const removingIndex = colorId.findIndex((id) => id.equals(selectedColorId));
                    colorId.splice(removingIndex, 1);
                    colorCode.splice(removingIndex, 1);
                    // Remove 'selected' class previously-selected row.
                    row.classList.remove('selected');
                } else {
                    // Add selection if clicked row was not previously selected.
                    colorId.push(colors[rowIndex]['_id']);
                    colorCode.push(colors[rowIndex]['Color_Code']);
                    // Add 'selected' class to selected row.
                    row.classList.add('selected');
                }
            }
        });
    }

    async function colorRegistration() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Color Registration</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Color Code :</p>
                        <input class="input--l" id="code" type="text" autocomplete="off" />
                    </div>
                        <div class="input-box">
                        <p class="attribute">Color Name :</p>
                        <input class="input--l" id="name" type="text" autocomplete="off" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;

        window.save = async function () {
            const code = document.getElementById('code').value;
            const name = document.getElementById('name').value;

            // Prompt error if not all fields are filled.
            const inputFields = [code, name];
            const isFilled = inputFields.every((inputField) => inputField !== '');
            if (isFilled === false) {
                // Display error messages.
                if (code === '') {
                    // Code block
                }
                if (name === '') {
                    // Code block
                }

                await ErrorDialog('Not all fields filled.');
                return;
            }

            // Insert new record to db.
            try {
                await dbMongo.collection('Color').insertOne({
                    Color_Code: code,
                    Color_Name: name,
                });
            } catch (err) {
                await ErrorDialog(err.message);
            }

            colorSelection();
        };

        window.returnPage = () => colorSelection();
        window.logout = () => logOut(appMongo);
    }

    window.register = async function () {
        // Check if all details are provided.
        const inputFields = [partId, customerId, supplierId, deliveryIncoming];
        const isFilled = inputFields.every((inputField) => inputField !== '');
        if ((isFilled && colorId.length !== 0) === false) {
            // Display error messages.
            if (partId === '') {
                // Code block
            }
            if (customerId === '') {
                // Code block
            }
            if (supplierId === '') {
                // Code block
            }
            if (colorId.length === 0) {
                // Code block
            }

            await ErrorDialog('Not all fields filled.');
            return;
        }

        // Show loading message.

        // Register the same product one or multiple times based on the quantity specified by the user.
        for (let i = 0; i < quantity; i++) {
            try {
                const deliveryIncomingResult = await dbMongo.collection('Delivery_Incoming').insertOne({
                    Time_In: deliveryIncoming,
                    Created_By: ObjectId(appMongo.currentUser.id),
                });

                const productResult = await dbMongo.collection('Product').insertOne({
                    Part_id: partId,
                    Status: 'Ongoing',
                    Color_id: colorId,
                    Customer_id: customerId,
                    Supplier_id: supplierId,
                    Created_By: ObjectId(appMongo.currentUser.id),
                    Deli_Incoming_id: deliveryIncomingResult['insertedId'],
                    Product_Incoming: [],
                    Current_Station_id: ObjectId('67042540bd53681a12cbe99c'), // ObjectId of "Generating QR Code" station.
                });
                const productId = productResult['insertedId'];
                await dbMongo
                    .collection('Product')
                    .updateOne({ _id: productId }, { $set: { Product_id: productId.toString() } });
            } catch (err) {
                await ErrorDialog(err.message);
                return;
            }
        }

        // Clear all fields and notify user on successful registration.
        partId = '';
        partName = '';
        document.getElementById('part').value = partName;
        customerId = '';
        customerName = '';
        document.getElementById('customer').value = customerName;
        supplierId = '';
        supplierName = '';
        document.getElementById('supplier').value = supplierName;
        colorId = [];
        colorCode = [];
        document.getElementById('color').value = colorCode.join('');
        deliveryIncoming = '';
        document.getElementById('deliveryIncoming').value = deliveryIncoming;
        quantity = 1;
        document.getElementById('quantity').value = quantity;
        await InfoDialog('Registration successful.');
    };
}

function loadPageSearch(user, role, appMongo, dbMongo) {
    document.getElementById('app').innerHTML = `
    <p class="return" id="return" onclick="returnPage()">< Return</p>
    <p class="logout" id="logout" onclick="logout()">Log Out</p>
    <img id="logo" class="logo--s">
    <p>Search Page</p>
    <div class="search">
      <div class="input-area">
        <div class="input-box">
          <p class="attribute">Product ID :</p>
          <input class="input" id="productID" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Customer Name :</p>
          <input class="input" id="customerName" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Supplier Name :</p>
          <input class="input" id="supplierName" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Brand :</p>
          <input class="input" id="brand" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Model :</p>
          <input class="input" id="model" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Part Name :</p>
          <input class="input" id="partName" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Model Creation Year :</p>
          <input class="input" id="modelCreationYear" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Color Code :</p>
          <input class="input" id="colorCode" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Created by :</p>
          <input class="input" id="createdBy" type="text" autocomplete="off" />
        </div>
        <div class="input-box">
          <p class="attribute">Status :</p>
          <input class="input" id="status" type="text" autocomplete="off" />
        </div>
      </div>
      <div class="choice-area">
        <button class="btn" id="btnFilter" onclick="filter()">Filter</button>
      </div>
    </div>
  `;

    document.getElementById('logo').src = logo;
    const elementProductId = document.getElementById('productID');
    const elementCustomerName = document.getElementById('customerName');
    const elementSupplierName = document.getElementById('supplierName');
    const elementBrand = document.getElementById('brand');
    const elementModel = document.getElementById('model');
    const elementPartName = document.getElementById('partName');
    const elementModelCreationYear = document.getElementById('modelCreationYear');
    const elementColorCode = document.getElementById('colorCode');
    const elementCreatedBy = document.getElementById('createdBy');
    const elementStatus = document.getElementById('status');

    window.filter = async function () {
        const productId = elementProductId.value;
        const customerName = elementCustomerName.value;
        const supplierName = elementSupplierName.value;
        const brand = elementBrand.value;
        const model = elementModel.value;
        const partName = elementPartName.value;
        const modelCreationYear = elementModelCreationYear.value;
        const colorCode = elementColorCode.value;
        const createdBy = elementCreatedBy.value;
        const status = elementStatus.value;
        let tempResult;
        try {
            const query = [];
            if (productId !== '') {
                query.push({ Product_id: { $regex: new RegExp(`.*${productId}.*`, 'i') } });
            }
            if (customerName !== '') {
                query.push({ Customer_Name: { $regex: new RegExp(`.*${customerName}.*`, 'i') } });
            }
            if (supplierName !== '') {
                query.push({ Supplier_Name: { $regex: new RegExp(`.*${supplierName}.*`, 'i') } });
            }
            if (brand !== '') {
                query.push({ Brand: { $regex: new RegExp(`.*${brand}.*`, 'i') } });
            }
            if (model !== '') {
                query.push({ Model: { $regex: new RegExp(`.*${model}.*`, 'i') } });
            }
            if (partName !== '') {
                query.push({ Part_Name: { $regex: new RegExp(`.*${partName}.*`, 'i') } });
            }
            if (modelCreationYear !== '') {
                query.push({ Model_Creation_Year: { $regex: new RegExp(`.*${modelCreationYear}.*`, 'i') } });
            }
            if (colorCode !== '') {
                query.push({ Color_Code: { $regex: new RegExp(`.*${colorCode}.*`, 'i') } });
            }
            if (createdBy !== '') {
                query.push({ Created_By: { $regex: new RegExp(`.*${createdBy}.*`, 'i') } });
            }
            if (status !== '') {
                query.push({ Status: { $regex: new RegExp(`.*${status}.*`, 'i') } });
            }
            const collectionMongo = dbMongo.collection('Products_View');
            if (query.length === 0) {
                tempResult = await collectionMongo.find({});
            } else {
                tempResult = await collectionMongo.find({
                    $or: query,
                });
            }
        } catch (err) {
            ErrorDialog(err.message);
        }
        const filteredProducts = tempResult;

        // Navigate to result page.
        loadPageResult(user, role, appMongo, dbMongo, filteredProducts);
    };

    window.returnPage = async function () {
        // Warn user if any of the fields are filled.
        const inputFields = [
            elementProductId,
            elementCustomerName,
            elementSupplierName,
            elementBrand,
            elementModel,
            elementPartName,
            elementModelCreationYear,
            elementColorCode,
            elementCreatedBy,
            elementStatus,
        ];
        if (inputFields.every((inputField) => inputField.value === '') === false) {
            const result = await WarningDialog('Confirm', 'Discard changes?');
            if (result !== true) {
                return;
            }
        }

        // Navigate to home page.
        loadPageHome(user, role, appMongo, dbMongo);
    };

    window.logout = async function () {
        // Warn user if any of the registration fields are filled.
        const inputFields = [
            elementProductId,
            elementCustomerName,
            elementSupplierName,
            elementBrand,
            elementModel,
            elementPartName,
            elementModelCreationYear,
            elementColorCode,
            elementCreatedBy,
            elementStatus,
        ];
        if (inputFields.every((inputField) => inputField.value === '') === false) {
            const result = await WarningDialog('Confirm', 'Discard changes?');
            if (result !== true) {
                return;
            }
        }

        logOut(appMongo);
    };
}

function loadPageResult(user, role, appMongo, dbMongo, filteredProducts) {
    document.getElementById('app').innerHTML = `
    <p class="return" id="return" onclick="returnPage()">< Return</p>
    <p class="logout" id="logout" onclick="logout()">Log Out</p>
    <img id="logo" class="logo--s">
    <p>Search Results</p>
    <div class="searchResult">    
        <div class="resultTable">
        <table id='table'>
            <thead>
            <tr>
                <th>Prod ID</th>
                <th>Customer</th>
                <th>Supplier</th>
                <th>Part</th>
                <th>Model</th>
                <th>Brand</th>
                <th>Creation Year</th>
                <th>Color Code</th>
                <th>Created by</th>
                <th>Status</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
        </div>
    </div>
  `;

    document.getElementById('logo').src = logo;
    const tableElement = document.getElementById('table').getElementsByTagName('tbody')[0];
    for (const product of filteredProducts) {
        const row = tableElement.insertRow();
        const keys = [
            'Product_id',
            'Customer_Name',
            'Supplier_Name',
            'Part_Name',
            'Part_Model',
            'Part_Brand',
            'Part_Model_Creation_Year',
            'Color',
            'Created_By',
            'Status',
        ];
        keys.forEach((key, index) => {
            const cell = row.insertCell(index);
            if (product[key] !== undefined) {
                let value = product[key];

                // Format spacing after comma when converting array to string.
                if (key === 'Color') {
                    const array = [];
                    for (const color of value) {
                        array.push(color['Color_Code']);
                    }
                    value = array.join(', ');
                }

                cell.innerHTML = value;
            } else {
                cell.innerHTML = '-';
            }
        });
    }

    tableElement.addEventListener('click', function (event) {
        const target = event.target;
        if (target.tagName === 'TD') {
            const row = target.parentElement;
            const rowIndex = row.rowIndex - 1;

            // Remove 'selected' class from any previously selected row.
            const selectedRows = tableElement.getElementsByClassName('selected');
            while (selectedRows.length > 0) {
                selectedRows[0].classList.remove('selected');
            }

            // Add 'selected' class to selected row.
            row.classList.add('selected');
        }
    });

    tableElement.addEventListener('dblclick', (event) => {
        // Find the clicked product.
        const target = event.target;
        if (target.tagName === 'TD') {
            const row = target.parentElement;
            const rowIndex = row.rowIndex - 1;
            const product = filteredProducts[rowIndex];

            // Navigate to the product details page.
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        }
    });

    window.returnPage = async function () {
        // Give user warning before they leave the page.
        const result = await WarningDialog('Confirm', 'Leave page?');
        if (result !== true) {
            return;
        }

        loadPageSearch(user, role, appMongo, dbMongo);
    };

    window.logout = async function () {
        // Give user warning before they leave the page.
        const result = await WarningDialog('Confirm', 'Leave page?');
        if (result !== true) {
            return;
        }

        logOut(appMongo);
    };
}

function loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product) {
    document.getElementById('app').innerHTML = `
        <p class="return" id="return" onclick="returnPage()">< Return</p>
        <p class="logout" id="logout" onclick="logout()">Log Out</p>
        <img id="logo" class="logo--s">
        <p>Product Details</p>
        <div class="details">
            <div class="titleArea">
                <p class="title">Product</p>
                <button class="editBtn" onclick="editProduct()"><img class="editIcon"></button>
            </div>
            <hr>
            <div class="section--3">
                <div class="field">
                    <p class="attribute">Product ID :</p>
                    <textarea class="input--1" id="productID" rows="1" cols="1" readonly></textarea>
                </div>        
                <div class="field">
                    <p class="attribute">Status :</p>
                    <textarea class="input--1" id="status" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Current Station :</p>
                    <textarea class="input--1" id="currentStation" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Station Status :</p>
                    <textarea class="input--1" id="stationStatus" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Delivery Incoming :</p>
                    <textarea class="input--1" id="deliveryIncoming" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Created by :</p>
                    <textarea class="input--1" id="createdBy" rows="1" cols="1" readonly></textarea>
                </div>
            </div>
            <div class="titleArea">
                <p class="title">Status Logs</p>
            </div>
            <hr>
            <textarea class="input--f" id="productIncoming" rows="1" cols="1" readonly></textarea>
            <div class="titleArea">
                <p class="title">Customer</p>
                <button class="editBtn" onclick="editCustomer()"><img class="editIcon"></button>
            </div>
            <hr>
            <div class="section--3">
                <div class="field">
                    <p class="attribute">Name :</p>
                    <textarea class="input--3" id="customerName" rows="1" cols="1" readonly></textarea>
                </div>        
                <div class="field">
                    <p class="attribute">Contact Number :</p>
                    <textarea class="input--1" id="customerContact" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Address :</p>
                    <textarea class="input--4" id="customerAddress" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Postcode :</p>
                    <textarea class="input--1" id="customerPostcode" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Area :</p>
                    <textarea class="input--1" id="customerArea" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">State :</p>
                    <textarea class="input--1" id="customerState" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Country :</p>
                    <textarea class="input--1" id="customerCountry" rows="1" cols="1" readonly></textarea>
                </div>
            </div>
            <div class="titleArea">
                <p class="title">Supplier</p>
                <button class="editBtn" onclick="editSupplier()"><img class="editIcon"></button>
            </div>
            <hr>
            <div class="section--3">
                <div class="field">
                    <p class="attribute">Name :</p>
                    <textarea class="input--3" id="supplierName" rows="1" cols="1" readonly></textarea>
                </div>        
                <div class="field">
                    <p class="attribute">Contact Number :</p>
                    <textarea class="input--1" id="supplierContact" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Address :</p>
                    <textarea class="input--4" id="supplierAddress" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Postcode :</p>
                    <textarea class="input--1" id="supplierPostcode" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Area :</p>
                    <textarea class="input--1" id="supplierArea" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">State :</p>
                    <textarea class="input--1" id="supplierState" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Country :</p>
                    <textarea class="input--1" id="supplierCountry" rows="1" cols="1" readonly></textarea>
                </div>
            </div>
            <div class="titleArea">
                <p class="title">Part</p>
                <button class="editBtn" onclick="editPart()"><img class="editIcon"></button>
            </div>
            <hr>
            <div class="section--2">
                <div class="field">
                    <p class="attribute">Name :</p>
                    <textarea class="input--1" id="partName" rows="1" cols="1" readonly></textarea>
                </div>        
                <div class="field">
                    <p class="attribute">Model :</p>
                    <textarea class="input--1" id="partModel" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Brand :</p>
                    <textarea class="input--1" id="partBrand" rows="1" cols="1" readonly></textarea>
                </div>
                <div class="field">
                    <p class="attribute">Model Creation Year :</p>
                    <textarea class="input--1" id="partYear" rows="1" cols="1" readonly></textarea>
                </div>
            </div>
            <div class="titleArea">
                <p class="title">Color</p>
                <button class="editBtn" onclick="editColor()"><img class="editIcon"></button>
            </div>
            <hr>
            <div class="section--2" id="color">
            </div>
            <br>
        </div>
    `;

    document.getElementById('logo').src = logo;
    const editIcons = document.getElementsByClassName('editIcon');
    for (let icon of editIcons) {
        icon.src = logoPen;
    }

    // Product fields
    document.getElementById('productID').value = product['Product_id'];
    document.getElementById('status').value = product['Status'];
    document.getElementById('currentStation').value = product['Current_Station'];
    document.getElementById('stationStatus').value = product['Station_Status'];
    document.getElementById('deliveryIncoming').value = product['Delivery_Incoming'].toLocaleString();
    document.getElementById('createdBy').value = product['Created_By'];

    // Status Log fields
    // Retrieve all check-in time with their station, sort them by check-in time, then format them to string before pushing them into a big text string.
    const logs = [];
    product['Product_Incoming'].forEach((station) => {
        const checkIns = station['Check_In'];
        const stationId = station['Station_id'].toString();
        let stationName;
        if (stationId === '66c89c21a6f55a3f7d0b31fe') {
            stationName = 'St1 - Unpackaging Station';
        } else if (stationId === '66c89c97a6f55a3f7d0b31ff') {
            stationName = 'St2 - QC 1 Station';
        } else if (stationId === '66c89bf3a33fdbb44c95df1d') {
            stationName = 'St3 - Masking Station';
        } else if (stationId === '66c89d96d93f2fc7be2226b3') {
            stationName = 'St4 - QC 2 Station';
        } else if (stationId === '66c89ddd4365e8494de73b5f') {
            stationName = 'St5 - Painting Station';
        } else if (stationId === '66c89df34365e8494de73b60') {
            stationName = 'St6 - QC 3 Station';
        } else if (stationId === '66c89df74365e8494de73b61') {
            stationName = 'St7 - Polishing Station';
        } else if (stationId === '66d00e81fb24a79e0d4bed99') {
            stationName = 'St8 - QC 4 Station';
        } else if (stationId === '66d00ea6fb24a79e0d4bed9b') {
            stationName = 'St9 - Assembly Station';
        } else if (stationId === '66d00eb5fb24a79e0d4bed9c') {
            stationName = 'St10 - PDI Station';
        } else if (stationId === '66d00ebffb24a79e0d4bed9d') {
            stationName = 'St11- Packing Station';
        } else if (stationId === '66d00e98fb24a79e0d4bed9a') {
            stationName = 'St12 - Dispose Station';
        } else if (stationId === '66c89d3e08f4dbbaf05bcd2d') {
            stationName = 'St1(A) - Reject Station';
        } else if (stationId === '67042540bd53681a12cbe99c') {
            stationName = 'Generating QR Code';
        } else if (stationId === '67042cf1bd53681a12cbe9a6') {
            stationName = 'Overall Station';
        } else {
            stationName = '-';
        }

        checkIns.forEach((checkIn) => {
            const log = {
                timeStamp: checkIn['Time_Check_In'],
                station: stationName,
            };
            logs.push(log);
        });
    });
    let logText = '';
    logs.forEach((log) => {
        logText = logText + `${log['timeStamp']} :  ${log['station']}\n`;
    });
    document.getElementById('productIncoming').value = logText;

    // Customer fields
    document.getElementById('customerName').value = product['Customer_Name'];
    document.getElementById('customerContact').value = product['Customer_Contact'];
    document.getElementById('customerAddress').value = product['Customer_Address'];
    document.getElementById('customerPostcode').value = product['Customer_Postcode'];
    document.getElementById('customerArea').value = product['Customer_Area'];
    document.getElementById('customerState').value = product['Customer_State'];
    document.getElementById('customerCountry').value = product['Customer_Country'];

    // Supplier fields
    document.getElementById('supplierName').value = product['Supplier_Name'];
    document.getElementById('supplierContact').value = product['Supplier_Contact'];
    document.getElementById('supplierAddress').value = product['Supplier_Address'];
    document.getElementById('supplierPostcode').value = product['Supplier_Postcode'];
    document.getElementById('supplierArea').value = product['Supplier_Area'];
    document.getElementById('supplierState').value = product['Supplier_State'];
    document.getElementById('supplierCountry').value = product['Supplier_Country'];

    // Part fields
    document.getElementById('partName').value = product['Part_Name'];
    document.getElementById('partModel').value = product['Part_Model'];
    document.getElementById('partBrand').value = product['Part_Brand'];
    document.getElementById('partYear').value = product['Part_Model_Creation_Year'];

    // Color fields
    const divColor = document.getElementById('color');
    const colors = product['Color'];
    for (const color of colors) {
        const pColorCode = document.createElement('p');
        pColorCode.innerText = 'Code :';
        pColorCode.className = 'attribute';
        const fieldColorCode = document.createElement('textarea');
        fieldColorCode.className = 'input--1';
        fieldColorCode.readOnly = 'on';
        fieldColorCode.rows = '1';
        fieldColorCode.cols = '1';
        fieldColorCode.value = color['Color_Code'];
        const divFieldColorCode = document.createElement('div');
        divFieldColorCode.className = 'field';
        divFieldColorCode.appendChild(pColorCode);
        divFieldColorCode.appendChild(fieldColorCode);
        divColor.appendChild(divFieldColorCode);

        const pColorName = document.createElement('p');
        pColorName.innerText = 'Name :';
        pColorName.className = 'attribute';
        const fieldColorName = document.createElement('textarea');
        fieldColorName.className = 'input--1';
        fieldColorCode.readOnly = 'on';
        fieldColorCode.rows = '1';
        fieldColorCode.cols = '1';
        fieldColorName.value = color['Color_Name'];
        const divFieldColorName = document.createElement('div');
        divFieldColorName.className = 'field';
        divFieldColorName.appendChild(pColorName);
        divFieldColorName.appendChild(fieldColorName);
        divColor.appendChild(divFieldColorName);
    }

    window.editProduct = () => productEdit();

    window.editCustomer = () => customerSelection();

    window.editSupplier = () => supplierSelection();

    window.editPart = () => partSelection();

    window.editColor = () => colorSelection();

    async function productEdit() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPageProductDetails()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Edit Product</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Delivery Incoming :</p>
                        <input class="input--l" id="deliveryIncoming" type="datetime-local" style="font-family: Arial, Helvetica, sans-serif" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;
        const deliveryIncoming = product['Delivery_Incoming'].toISOString().slice(0, 16); // Converts the retrieved datetime into a input field compatible format.
        const elementDeliveryIncoming = document.getElementById('deliveryIncoming');
        elementDeliveryIncoming.value = deliveryIncoming;

        window.save = async function () {
            // Update the product details in db if changed.
            if (deliveryIncoming !== elementDeliveryIncoming.value) {
                try {
                    const result = await WarningDialog('Confirm', 'Confirm changes?');
                    if (result !== true) {
                        return;
                    }
                    // Intentionally left non-functional for now.
                    /* await dbMongo.collection('Product').updateOne(
                        {
                            _id: product['_id'],
                        },
                        {
                            $set: { Customer_id: selectedCustomerId },
                        }
                    ); */
                    await InfoDialog('Details updated.');
                } catch (err) {
                    await ErrorDialog(err.message);
                }
            }
            try {
                const newProduct = await dbMongo.collection('Products_View').findOne({
                    _id: product['_id'],
                });
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, newProduct);
            } catch (err) {
                await ErrorDialog(err.message);
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
            }
        };

        window.returnPageProductDetails = async function () {
            // Warn user if any of the fields are modified.
            if (deliveryIncoming !== elementDeliveryIncoming.value) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        };

        window.logout = async function () {
            // Warn user if any of the fields are modified.
            if (deliveryIncoming !== elementDeliveryIncoming.value) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            logOut(appMongo);
        };
    }

    // Product details for modification state tracking.
    let partId = product['Part_id'];
    let customerId = product['Customer_id'];
    let supplierId = product['Supplier_id'];
    const colorId = [];
    for (let color of product['Color']) {
        colorId.push(color['Color_id']);
    }

    async function customerSelection() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPageProductDetails()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Customer Selection</p>
            <div class="searchResult">
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="customerRegistration()">New</button>
                    <button class="btn" id="btnConfirm" onclick="confirm()">Confirm</button>
                </div>
                <div class="resultTable">
                    <table id='table'>
                        <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th>Contact No</th>
                            <th>Address</th>
                            <th>Postcode</th>
                            <th>Area</th>
                            <th>State</th>
                            <th>Country</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;
        const tableElement = document.getElementById('table');
        let selectedCustomerId = customerId;

        let tempResult;
        try {
            tempResult = await dbMongo.collection('Customer').find({});
            const tableBodyElement = tableElement.getElementsByTagName('tbody')[0];
            for (const customer of tempResult) {
                const row = tableBodyElement.insertRow();
                const keys = ['Customer_Name', 'Contact_Name', 'Address', 'Postcode', 'Area', 'State', 'Country'];
                keys.forEach((key, index) => {
                    const cell = row.insertCell(index);
                    if (customer[key] !== undefined) {
                        let value = customer[key];
                        cell.innerHTML = value;
                    } else {
                        cell.innerHTML = '-';
                    }
                });

                // Add 'selected' class to previously selected row.
                if (customer['_id'].equals(customerId)) {
                    row.classList.add('selected');
                }
            }
        } catch (err) {
            await ErrorDialog(err.message);
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        }
        const customers = tempResult;
        tempResult = undefined;

        tableElement.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement;
                const rowIndex = row.rowIndex - 1;
                selectedCustomerId = ObjectId(customers[rowIndex]['_id']);

                // Remove 'selected' class from any previously selected row.
                const selectedRows = tableElement.getElementsByClassName('selected');
                while (selectedRows.length > 0) {
                    selectedRows[0].classList.remove('selected');
                }

                // Add 'selected' class to selected row.
                row.classList.add('selected');
            }
        });

        window.customerRegistration = () => customerRegistration();

        window.confirm = async function () {
            // Update the product details in db if changed.
            if (customerId !== selectedCustomerId) {
                try {
                    const result = await WarningDialog('Confirm', 'Confirm changes?');
                    if (result !== true) {
                        return;
                    }
                    await dbMongo.collection('Product').updateOne(
                        {
                            _id: product['_id'],
                        },
                        {
                            $set: { Customer_id: selectedCustomerId },
                        }
                    );
                    await InfoDialog('Details updated.');
                } catch (err) {
                    await ErrorDialog(err.message);
                }
            }
            try {
                const newProduct = await dbMongo.collection('Products_View').findOne({
                    _id: product['_id'],
                });
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, newProduct);
            } catch (err) {
                await ErrorDialog(err.message);
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
            }
        };

        window.returnPageProductDetails = async function () {
            // Warn user if any of the fields are modified.
            if (customerId !== selectedCustomerId) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        };

        window.logout = async function () {
            // Warn user if any of the fields are modified.
            if (customerId !== selectedCustomerId) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            logOut(appMongo);
        };
    }

    async function customerRegistration() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Customer Registration</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Customer Name :</p>
                        <input class="input--l" id="name" type="text" autocomplete="off" />
                    </div>
                        <div class="input-box">
                        <p class="attribute">Contact Number :</p>
                        <input class="input--l" id="contact" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Address :</p>
                        <input class="input--l" id="address" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Postcode :</p>
                        <input class="input--l" id="postcode" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Area :</p>
                        <input class="input--l" id="area" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">State :</p>
                        <input class="input--l" id="state" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Country :</p>
                        <input class="input--l" id="country" type="text" autocomplete="off" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;

        window.save = async function () {
            const name = document.getElementById('name').value;
            const contact = document.getElementById('contact').value;
            const address = document.getElementById('address').value;
            const postcode = document.getElementById('postcode').value;
            const area = document.getElementById('area').value;
            const state = document.getElementById('state').value;
            const country = document.getElementById('country').value;

            // Prompt error if not all fields are filled.
            const inputFields = [name, contact, address, postcode, area, state, country];
            const isFilled = inputFields.every((inputField) => inputField !== '');
            if (isFilled === false) {
                // Display error messages.
                if (name === '') {
                    // Code block
                }
                if (contact === '') {
                    // Code block
                }
                if (address === '') {
                    // Code block
                }
                if (postcode === '') {
                    // Code block
                }
                if (area === '') {
                    // Code block
                }
                if (state === '') {
                    // Code block
                }
                if (country === '') {
                    // Code block
                }

                await ErrorDialog('Not all fields filled.');
                return;
            }

            // Insert new record to db.
            try {
                await dbMongo.collection('Customer').insertOne({
                    Customer_Name: name,
                    Contact_Number: contact,
                    Address: address,
                    Postcode: postcode,
                    Area: area,
                    State: state,
                    Country: country,
                });
            } catch (err) {
                await ErrorDialog(err.message);
            }

            customerSelection();
        };

        window.returnPage = () => customerSelection();
        window.logout = () => logOut(appMongo);
    }

    async function supplierSelection() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPageProductDetails()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Supplier Selection</p>
            <div class="searchResult">
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="supplierRegistration()">New</button>
                    <button class="btn" id="btnConfirm" onclick="confirm()">Confirm</button>
                </div>
                <div class="resultTable">
                    <table id='table'>
                        <thead>
                        <tr>
                            <th>Supplier Name</th>
                            <th>Contact No</th>
                            <th>Address</th>
                            <th>Postcode</th>
                            <th>Area</th>
                            <th>State</th>
                            <th>Country</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
            `;

        document.getElementById('logo').src = logo;
        const tableElement = document.getElementById('table');
        let selectedSupplierId = supplierId;

        let tempResult;
        try {
            tempResult = await dbMongo.collection('Supplier').find({});
            const tableBodyElement = tableElement.getElementsByTagName('tbody')[0];
            for (const supplier of tempResult) {
                const row = tableBodyElement.insertRow();
                const keys = ['Supplier_Name', 'Contact_Name', 'Address', 'Postcode', 'Area', 'State', 'Country'];
                keys.forEach((key, index) => {
                    const cell = row.insertCell(index);
                    if (supplier[key] !== undefined) {
                        let value = supplier[key];
                        cell.innerHTML = value;
                    } else {
                        cell.innerHTML = '-';
                    }
                });

                // Add 'selected' class to previously selected row.
                if (supplier['_id'].equals(supplierId)) {
                    row.classList.add('selected');
                }
            }
        } catch (err) {
            await ErrorDialog(err.message);
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        }
        const suppliers = tempResult;
        tempResult = undefined;

        tableElement.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement;
                const rowIndex = row.rowIndex - 1;
                selectedSupplierId = ObjectId(suppliers[rowIndex]['_id']);

                // Remove 'selected' class from any previously selected row.
                const selectedRows = tableElement.getElementsByClassName('selected');
                while (selectedRows.length > 0) {
                    selectedRows[0].classList.remove('selected');
                }

                // Add 'selected' class to selected row.
                row.classList.add('selected');
            }
        });

        window.supplierRegistration = () => supplierRegistration();

        window.confirm = async function () {
            // Update the product details in db if changed.
            if (supplierId !== selectedSupplierId) {
                try {
                    const result = await WarningDialog('Confirm', 'Confirm changes?');
                    if (result !== true) {
                        return;
                    }
                    await dbMongo.collection('Product').updateOne(
                        {
                            _id: product['_id'],
                        },
                        {
                            $set: { Supplier_id: selectedSupplierId },
                        }
                    );
                    await InfoDialog('Details updated.');
                } catch (err) {
                    await ErrorDialog(err.message);
                }
            }
            try {
                const newProduct = await dbMongo.collection('Products_View').findOne({
                    _id: product['_id'],
                });
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, newProduct);
            } catch (err) {
                await ErrorDialog(err.message);
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
            }
        };

        window.returnPageProductDetails = async function () {
            // Warn user if any of the fields are modified.
            if (supplierId !== selectedSupplierId) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        };

        window.logout = async function () {
            // Warn user if any of the fields are modified.
            if (supplierId !== selectedSupplierId) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            logOut(appMongo);
        };
    }

    async function supplierRegistration() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Supplier Registration</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Supplier Name :</p>
                        <input class="input--l" id="name" type="text" autocomplete="off" />
                    </div>
                        <div class="input-box">
                        <p class="attribute">Contact Number :</p>
                        <input class="input--l" id="contact" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Address :</p>
                        <input class="input--l" id="address" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Postcode :</p>
                        <input class="input--l" id="postcode" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Area :</p>
                        <input class="input--l" id="area" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">State :</p>
                        <input class="input--l" id="state" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Country :</p>
                        <input class="input--l" id="country" type="text" autocomplete="off" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;

        window.save = async function () {
            const name = document.getElementById('name').value;
            const contact = document.getElementById('contact').value;
            const address = document.getElementById('address').value;
            const postcode = document.getElementById('postcode').value;
            const area = document.getElementById('area').value;
            const state = document.getElementById('state').value;
            const country = document.getElementById('country').value;

            // Prompt error if not all fields are filled.
            const inputFields = [name, contact, address, area, postcode, state, country];
            const isFilled = inputFields.every((inputField) => inputField !== '');
            if (isFilled === false) {
                // Display error messages.
                if (name === '') {
                    // Code block
                }
                if (contact === '') {
                    // Code block
                }
                if (address === '') {
                    // Code block
                }
                if (postcode === '') {
                    // Code block
                }
                if (area === '') {
                    // Code block
                }
                if (state === '') {
                    // Code block
                }
                if (country === '') {
                    // Code block
                }

                await ErrorDialog('Not all fields filled.');
                return;
            }

            // Insert new record to db.
            try {
                await dbMongo.collection('Supplier').insertOne({
                    Supplier_Name: name,
                    Contact_Number: contact,
                    Address: address,
                    Area: area,
                    Postcode: postcode,
                    State: state,
                    Country: country,
                });
            } catch (err) {
                await ErrorDialog(err.message);
            }

            supplierSelection();
        };

        window.returnPage = () => supplierSelection();
        window.logout = () => logOut(appMongo);
    }

    async function partSelection() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPageProductDetails()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Part Selection</p>
            <div class="searchResult">
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="partRegistration()">New</button>
                    <button class="btn" id="btnConfirm" onclick="confirm()">Confirm</button>
                </div>
                <div class="resultTable">
                    <table id='table'>
                        <thead>
                        <tr>
                            <th>Part Name</th>
                            <th>Model</th>
                            <th>Brand</th>
                            <th>Model Creation Year</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
            `;

        document.getElementById('logo').src = logo;
        const tableElement = document.getElementById('table');
        let selectedPartId = partId;

        let tempResult;
        try {
            tempResult = await dbMongo.collection('Part').find({});
            const tableBodyElement = tableElement.getElementsByTagName('tbody')[0];
            for (const part of tempResult) {
                const row = tableBodyElement.insertRow();
                const keys = ['Part_Name', 'Model', 'Brand', 'Year'];
                keys.forEach((key, index) => {
                    const cell = row.insertCell(index);
                    if (part[key] !== undefined) {
                        let value = part[key];
                        cell.innerHTML = value;
                    } else {
                        cell.innerHTML = '-';
                    }
                });

                // Add 'selected' class to previously selected row.
                if (part['_id'].equals(partId)) {
                    row.classList.add('selected');
                }
            }
        } catch (err) {
            await ErrorDialog(err.message);
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        }
        const parts = tempResult;
        tempResult = undefined;

        tableElement.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement;
                const rowIndex = row.rowIndex - 1;
                selectedPartId = ObjectId(parts[rowIndex]['_id']);

                // Remove 'selected' class from any previously selected row.
                const selectedRows = tableElement.getElementsByClassName('selected');
                while (selectedRows.length > 0) {
                    selectedRows[0].classList.remove('selected');
                }

                // Add 'selected' class to selected row.
                row.classList.add('selected');
            }
        });

        window.partRegistration = () => partRegistration();

        window.confirm = async function () {
            // Update the product details in db if changed.
            if (partId !== selectedPartId) {
                try {
                    const result = await WarningDialog('Confirm', 'Confirm changes?');
                    if (result !== true) {
                        return;
                    }
                    await dbMongo.collection('Product').updateOne(
                        {
                            _id: product['_id'],
                        },
                        {
                            $set: { Part_id: selectedPartId },
                        }
                    );
                    await InfoDialog('Details updated.');
                } catch (err) {
                    await ErrorDialog(err.message);
                }
            }
            try {
                const newProduct = await dbMongo.collection('Products_View').findOne({
                    _id: product['_id'],
                });
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, newProduct);
            } catch (err) {
                await ErrorDialog(err.message);
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
            }
        };

        window.returnPageProductDetails = async function () {
            // Warn user if any of the fields are modified.
            if (partId !== selectedPartId) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        };

        window.logout = async function () {
            // Warn user if any of the fields are modified.
            if (partId !== selectedPartId) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            logOut(appMongo);
        };
    }

    async function partRegistration() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Part Registration</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Part Name :</p>
                        <input class="input--l" id="name" type="text" autocomplete="off" />
                    </div>
                        <div class="input-box">
                        <p class="attribute">Model :</p>
                        <input class="input--l" id="model" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Brand :</p>
                        <input class="input--l" id="brand" type="text" autocomplete="off" />
                    </div>
                    <div class="input-box">
                        <p class="attribute">Year :</p>
                        <input class="input--l" id="year" type="number" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;

        window.save = async function () {
            const name = document.getElementById('name').value;
            const model = document.getElementById('model').value;
            const brand = document.getElementById('brand').value;
            const year = Number(document.getElementById('year').value);

            // Prompt error if not all fields are filled.
            const inputFields = [name, model, brand];
            const isFilled = inputFields.every((inputField) => inputField !== '');
            if ((isFilled && year !== 0) === false) {
                // Display error messages.
                if (name === '') {
                    // Code block
                }
                if (model === '') {
                    // Code block
                }
                if (brand === '') {
                    // Code block
                }
                if (year === 0) {
                    // Code block
                }

                await ErrorDialog('Not all fields filled.');
                return;
            }

            // Insert new record to db.
            try {
                await dbMongo.collection('Part').insertOne({
                    Part_Name: name,
                    Model: model,
                    Brand: brand,
                    Year: year,
                });
            } catch (err) {
                await ErrorDialog(err.message);
            }

            partSelection();
        };

        window.returnPage = () => partSelection();
        window.logout = () => logOut(appMongo);
    }

    async function colorSelection() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPageProductDetails()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Colors Selection</p>
            <div class="searchResult">
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="colorRegistration()">New</button>
                    <button class="btn" id="btnConfirm" onclick="confirm()">Confirm</button>
                </div>
                <div class="resultTable">
                    <table id='table'>
                        <thead>
                        <tr>
                            <th>Color Code</th>
                            <th>Color Name</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
            `;

        document.getElementById('logo').src = logo;
        const tableElement = document.getElementById('table');
        let newColorId = Array.from(colorId);

        let tempResult;
        try {
            tempResult = await dbMongo.collection('Color').find({});
            const tableBodyElement = tableElement.getElementsByTagName('tbody')[0];
            for (const color of tempResult) {
                const row = tableBodyElement.insertRow();
                const keys = ['Color_Code', 'Color_Name'];
                keys.forEach((key, index) => {
                    const cell = row.insertCell(index);
                    if (color[key] !== undefined) {
                        let value = color[key];
                        cell.innerHTML = value;
                    } else {
                        cell.innerHTML = '-';
                    }
                });

                // Add 'selected' class to previously selected row.
                for (const id of colorId) {
                    if (color['_id'].equals(id)) {
                        row.classList.add('selected');
                    }
                }
            }
        } catch (err) {
            await ErrorDialog(err.message);
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        }
        const colors = tempResult;
        tempResult = undefined;

        tableElement.addEventListener('click', function (event) {
            const target = event.target;
            if (target.tagName === 'TD') {
                const row = target.parentElement;
                const rowIndex = row.rowIndex - 1;
                const selectedColorId = colors[rowIndex]['_id'];

                // Check if clicked row was previously selected.
                const isSelected = row.className.match('(^|\\s+)selected(\\s+|$)');

                if (isSelected) {
                    // Remove selection if clicked row was previously selected.
                    const removingIndex = newColorId.findIndex((id) => id.equals(selectedColorId));
                    newColorId.splice(removingIndex, 1);
                    // Remove 'selected' class previously-selected row.
                    row.classList.remove('selected');
                } else {
                    // Add selection if clicked row was not previously selected.
                    newColorId.push(colors[rowIndex]['_id']);
                    // Add 'selected' class to selected row.
                    row.classList.add('selected');
                }
            }
        });

        window.colorRegistration = () => colorRegistration();

        window.confirm = async function () {
            // Update the product details in db if changed.
            if (arraysEqual(colorId, newColorId) !== true) {
                try {
                    const result = await WarningDialog('Confirm', 'Confirm changes?');
                    if (result !== true) {
                        return;
                    }
                    await dbMongo.collection('Product').updateOne(
                        {
                            _id: product['_id'],
                        },
                        {
                            $set: { Color_id: newColorId },
                        }
                    );
                    await InfoDialog('Details updated.');
                } catch (err) {
                    await ErrorDialog(err.message);
                }
            }
            try {
                const newProduct = await dbMongo.collection('Products_View').findOne({
                    _id: product['_id'],
                });
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, newProduct);
            } catch (err) {
                await ErrorDialog(err.message);
                loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
            }
        };

        window.returnPageProductDetails = async function () {
            // Warn user if any of the fields are modified.
            if (arraysEqual(colorId, newColorId) !== true) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            loadPageProductDetails(user, role, appMongo, dbMongo, filteredProducts, product);
        };

        window.logout = async function () {
            // Warn user if any of the fields are modified.
            if (arraysEqual(colorId, newColorId) !== true) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }
            logOut(appMongo);
        };

        // Check if the elements of two arrays regardless of the order of the elements.
        function arraysEqual(arr1, arr2) {
            if (arr1.length !== arr2.length) return false;

            const countOccurrences = (arr) => {
                const counter = {};
                for (const element of arr) {
                    counter[element] = (counter[element] || 0) + 1;
                }
                return counter;
            };

            const count1 = countOccurrences(arr1);
            const count2 = countOccurrences(arr2);

            return Object.keys(count1).every((key) => count1[key] === count2[key]);
        }
    }

    async function colorRegistration() {
        document.getElementById('app').innerHTML = `
            <p class="return" id="return" onclick="returnPage()">< Return</p>
            <p class="logout" id="logout" onclick="logout()">Log Out</p>
            <img id="logo" class="logo--s">
            <p>Color Registration</p>
            <div class="register">
                <div class="input-area">
                    <div class="input-box">
                        <p class="attribute">Color Code :</p>
                        <input class="input--l" id="code" type="text" autocomplete="off" />
                    </div>
                        <div class="input-box">
                        <p class="attribute">Color Name :</p>
                        <input class="input--l" id="name" type="text" autocomplete="off" />
                    </div>
                </div>
                <div class="choice-area">
                    <button class="btn" id="btnRegister" onclick="save()">Save</button>
                </div>
            </div>
        `;

        document.getElementById('logo').src = logo;

        window.save = async function () {
            const code = document.getElementById('code').value;
            const name = document.getElementById('name').value;

            // Prompt error if not all fields are filled.
            const inputFields = [code, name];
            const isFilled = inputFields.every((inputField) => inputField !== '');
            if (isFilled === false) {
                // Display error messages.
                if (code === '') {
                    // Code block
                }
                if (name === '') {
                    // Code block
                }

                await ErrorDialog('Not all fields filled.');
                return;
            }

            // Insert new record to db.
            try {
                await dbMongo.collection('Color').insertOne({
                    Color_Code: code,
                    Color_Name: name,
                });
            } catch (err) {
                await ErrorDialog(err.message);
            }

            colorSelection();
        };

        window.returnPage = () => colorSelection();
        window.logout = () => logOut(appMongo);
    }

    window.returnPage = () => loadPageResult(user, role, appMongo, dbMongo, filteredProducts);

    window.logout = () => logOut(appMongo);
}

function loadPageDashboard(user, role, appMongo, dbMongo) {
    document.getElementById('app').innerHTML = `
        <p class="return" id="return" onclick="returnPage()">< Return</p>
        <p class="logout" id="logout" onclick="logout()">Log Out</p>
        <img id="logo" class="logo--s">
        <p>Productivity Dashboard</p>
        <div class="dashboard">
            <div id="page1">
                <iframe class="widget" style="background: #FFFFFF;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" width="480" height="320" src="https://charts.mongodb.com/charts-project-0-wzktemh/embed/charts?id=5c45191d-1361-4621-a2e3-155a71f44626&maxDataAge=3600&theme=light&autoRefresh=true"></iframe>
                <iframe class="widget" style="background: #FFFFFF;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" width="480" height="320" src="https://charts.mongodb.com/charts-project-0-wzktemh/embed/charts?id=9e9b208d-460a-425a-a809-39c57b50d859&maxDataAge=3600&theme=light&autoRefresh=true"></iframe>
            </div>
            <div id="page2" style="display: none">
                <iframe class="widget" style="background: #FFFFFF;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" width="480" height="320" src="https://charts.mongodb.com/charts-project-0-wzktemh/embed/charts?id=b6a7e1a9-b5a2-49bc-88e4-85599085da34&maxDataAge=3600&theme=light&autoRefresh=true"></iframe>
                <iframe class="widget" style="background: #FFFFFF;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" width="480" height="320" src="https://charts.mongodb.com/charts-project-0-wzktemh/embed/charts?id=65e41b75-8f50-4096-9f9f-5c8a24a81cdf&maxDataAge=3600&theme=light&autoRefresh=true"></iframe>
            </div>
            <div id="page3" style="display: none">
                <iframe class="widget" style="background: #FFFFFF;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" width="480" height="320" src="https://charts.mongodb.com/charts-project-0-wzktemh/embed/charts?id=5cc9c00d-4b1b-4656-9c6f-80e7c2658708&maxDataAge=3600&theme=light&autoRefresh=true"></iframe>
                <iframe class="widget" style="background: #FFFFFF;border: none;border-radius: 2px;box-shadow: 0 2px 10px 0 rgba(70, 76, 79, .2);" width="480" height="320" src="https://charts.mongodb.com/charts-project-0-wzktemh/embed/charts?id=0a4f578f-36dd-4984-af71-f6fbbdcc615b&maxDataAge=3600&theme=light&autoRefresh=true"></iframe>
            </div>
            <p id="rArrow" class="rArrow" onclick="nextPage()">></p>
            <p id="lArrow" class="lArrow" style="display: none" onclick="previousPage()"><</p>
        </div>
    `;

    document.getElementById('logo').src = logo;
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    const page3 = document.getElementById('page3');
    const elementRArrow = document.getElementById('rArrow');
    const elementLArrow = document.getElementById('lArrow');
    let currentPage = 1;

    window.nextPage = function () {
        if (currentPage === 1) {
            page1.style.display = 'none';
            page2.style.display = 'block';
            elementLArrow.style.display = 'block';
        } else if (currentPage === 2) {
            page2.style.display = 'none';
            page3.style.display = 'block';
            elementRArrow.style.display = 'none';
        }
        currentPage++;
    };

    window.previousPage = function () {
        if (currentPage === 2) {
            page1.style.display = 'block';
            page2.style.display = 'none';
            elementLArrow.style.display = 'none';
        } else if (currentPage === 3) {
            page2.style.display = 'block';
            page3.style.display = 'none';
            elementRArrow.style.display = 'block';
        }
        currentPage--;
    };

    window.returnPage = () => loadPageHome(user, role, appMongo, dbMongo);

    window.logout = () => logOut(appMongo);
}

async function loadPageSettings(user, role, appMongo, dbMongo) {
    document.getElementById('app').innerHTML = `
        <p class="return" id="return" onclick="returnPage()">< Return</p>
        <p class="logout" id="logout" onclick="logout()">Log Out</p>
        <img id="logo" class="logo--s">
        <p>Settings</p>
        <div class="settings">
            <button class="btn" id="btnModifyTarget" onclick="loadPageAdjustTarget()">Adjust Daily Target</button>
        </div>
    `;

    document.getElementById('logo').src = logo;

    window.loadPageAdjustTarget = async function () {
        await loadPageAdjustTarget(user, role, appMongo, dbMongo);
    };

    window.returnPage = () => loadPageHome(user, role, appMongo, dbMongo);

    window.logout = () => logOut(appMongo);
}

async function loadPageAdjustTarget(user, role, appMongo, dbMongo) {
    document.getElementById('app').innerHTML = `
        <p class="return" id="return" onclick="returnPage()">< Return</p>
        <p class="logout" id="logout" onclick="logout()">Log Out</p>
        <img id="logo" class="logo--s">
        <p>Adjust Daily Target</p>
        <div class="adjustTarget">
            <div class="input-area">
                <div class="input-box">
                    <p class="attribute">Overall Station :</p>
                    <input class="input" id="overall" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St1 - Unpackaging Station :</p>
                    <input class="input" id="st1" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St2 - QC 1 Station :</p>
                    <input class="input" id="st2" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St3 - Masking Station :</p>
                    <input class="input" id="st3" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St4 - QC 2 Station :</p>
                    <input class="input" id="st4" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St5 - Painting Station :</p>
                    <input class="input" id="st5" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St6 - QC 3 Station :</p>
                    <input class="input" id="st6" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St7 - Polishing Station :</p>
                    <input class="input" id="st7" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St8 - QC 4 Station :</p>
                    <input class="input" id="st8" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St9 - Assembly Station :</p>
                    <input class="input" id="st9" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St10 - PDI Station :</p>
                    <input class="input" id="st10" type="number" autocomplete="off" />
                </div>
                <div class="input-box">
                    <p class="attribute">St11- Packing Station :</p>
                    <input class="input" id="st11" type="number" autocomplete="off" />
                </div>
            </div>
            <div class="choice-area">
                <button class="btn" id="btnUpdate" onclick="update()" disabled>Update</button>
            </div>
        </div>
    `;

    document.getElementById('logo').src = logo;
    const elementBtnUpdate = document.getElementById('btnUpdate');
    const elementOverall = document.getElementById('overall');
    const elementSt1 = document.getElementById('st1');
    const elementSt2 = document.getElementById('st2');
    const elementSt3 = document.getElementById('st3');
    const elementSt4 = document.getElementById('st4');
    const elementSt5 = document.getElementById('st5');
    const elementSt6 = document.getElementById('st6');
    const elementSt7 = document.getElementById('st7');
    const elementSt8 = document.getElementById('st8');
    const elementSt9 = document.getElementById('st9');
    const elementSt10 = document.getElementById('st10');
    const elementSt11 = document.getElementById('st11');
    const overallId = ObjectId('67042cf1bd53681a12cbe9a6');
    const st1Id = ObjectId('66c89c21a6f55a3f7d0b31fe');
    const st2Id = ObjectId('66c89c97a6f55a3f7d0b31ff');
    const st3Id = ObjectId('66c89bf3a33fdbb44c95df1d');
    const st4Id = ObjectId('66c89d96d93f2fc7be2226b3');
    const st5Id = ObjectId('66c89ddd4365e8494de73b5f');
    const st6Id = ObjectId('66c89df34365e8494de73b60');
    const st7Id = ObjectId('66c89df74365e8494de73b61');
    const st8Id = ObjectId('66d00e81fb24a79e0d4bed99');
    const st9Id = ObjectId('66d00ea6fb24a79e0d4bed9b');
    const st10Id = ObjectId('66d00eb5fb24a79e0d4bed9c');
    const st11Id = ObjectId('66d00ebffb24a79e0d4bed9d');

    // Retrieve today's target records for selected stations.
    // *New target records are created daily at 6.00am GMT+8, and the db stores them in GMT+0. Thus targets created for today will display yesterday's date on the db, so that's what we'll be searching for.
    try {
        let isModified = false;
        const collection = dbMongo.collection('Targets');
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        const endDate = new Date();
        let tempResult;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: overallId,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const overallInitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st1Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st1InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st2Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st2InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st3Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st3InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st4Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st4InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st5Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st5InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st6Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st6InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st7Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st7InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st8Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st8InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st9Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st9InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st10Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st10InitValue = tempResult['Num_Target'];
        tempResult = undefined;
        try {
            tempResult = await collection.findOne({
                Schedule_Date: {
                    $gte: startDate,
                    $lt: endDate,
                },
                Station_id: st11Id,
            });
        } catch (err) {
            await ErrorDialog(err.message);
        }
        const st11InitValue = tempResult['Num_Target'];
        tempResult = undefined;

        // Set all retrieved existing values to input fields.
        elementOverall.value = overallInitValue;
        elementSt1.value = st1InitValue;
        elementSt2.value = st2InitValue;
        elementSt3.value = st3InitValue;
        elementSt4.value = st4InitValue;
        elementSt5.value = st5InitValue;
        elementSt6.value = st6InitValue;
        elementSt7.value = st7InitValue;
        elementSt8.value = st8InitValue;
        elementSt9.value = st9InitValue;
        elementSt10.value = st10InitValue;
        elementSt11.value = st11InitValue;

        // Only enable the update button if any values have been changed.
        elementOverall.addEventListener('input', function (event) {
            if (elementOverall.value == overallInitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt1.addEventListener('input', function (event) {
            if (elementSt1.value == st1InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt2.addEventListener('input', function (event) {
            if (elementSt2.value == st2InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt3.addEventListener('input', function (event) {
            if (elementSt3.value == st3InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt4.addEventListener('input', function (event) {
            if (elementSt4.value == st4InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt5.addEventListener('input', function (event) {
            if (elementSt5.value == st5InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt6.addEventListener('input', function (event) {
            if (elementSt6.value == st6InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt7.addEventListener('input', function (event) {
            if (elementSt7.value == st7InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt8.addEventListener('input', function (event) {
            if (elementSt8.value == st8InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt9.addEventListener('input', function (event) {
            if (elementSt9.value == st9InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt10.addEventListener('input', function (event) {
            if (elementSt10.value == st10InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });
        elementSt11.addEventListener('input', function (event) {
            if (elementSt11.value == st11InitValue) {
                elementBtnUpdate.disabled = true;
                isModified = false;
            } else {
                elementBtnUpdate.disabled = false;
                isModified = true;
            }
        });

        // Update the values that are modified into the db.
        window.update = async function () {
            if (elementOverall.value != overallInitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: overallId,
                    },
                    {
                        $set: { Num_Target: Number(elementOverall.value) },
                    }
                );
            }
            if (elementSt1.value != st1InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st1Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt1.value) },
                    }
                );
            }
            if (elementSt2.value != st2InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st2Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt2.value) },
                    }
                );
            }
            if (elementSt3.value != st3InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st3Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt3.value) },
                    }
                );
            }
            if (elementSt4.value != st4InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st4Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt4.value) },
                    }
                );
            }
            if (elementSt5.value != st5InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st5Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt5.value) },
                    }
                );
            }
            if (elementSt6.value != st6InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st6Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt6.value) },
                    }
                );
            }
            if (elementSt7.value != st7InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st7Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt7.value) },
                    }
                );
            }
            if (elementSt8.value != st8InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st8Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt8.value) },
                    }
                );
            }
            if (elementSt9.value != st9InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st9Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt9.value) },
                    }
                );
            }
            if (elementSt10.value != st10InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st10Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt10.value) },
                    }
                );
            }
            if (elementSt11.value != st11InitValue) {
                await collection.updateOne(
                    {
                        Schedule_Date: {
                            $gte: startDate,
                            $lt: endDate,
                        },
                        Station_id: st11Id,
                    },
                    {
                        $set: { Num_Target: Number(elementSt11.value) },
                    }
                );
            }

            await InfoDialog("Settings updated.");

            // Reload page with updated values.
            loadPageAdjustTarget(user, role, appMongo, dbMongo);
        };

        window.returnPage = async function () {
            // Warn user if any of the fields are modified.
            if (isModified) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }

            loadPageSettings(user, role, appMongo, dbMongo);
        };

        window.logout = async function () {
            // Warn user if any of the fields are modified.
            if (isModified) {
                const result = await WarningDialog('Confirm', 'You have unsaved changes. Leave page?');
                if (result !== true) {
                    return;
                }
            }

            logOut(appMongo);
        };
    } catch (err) {
        await ErrorDialog(err.message);
    }
}

async function logOut(appMongo) {
    try {
        await appMongo.currentUser.logOut();
        loadPageLogin();
    } catch (err) {
        ErrorDialog(err.message);
    }
}
