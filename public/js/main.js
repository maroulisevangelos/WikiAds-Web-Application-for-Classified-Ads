// Put your client side JS code here


let url = "https://wiki-ads.onrender.com";

let logstate = false;//checks if a user is loged in
let username;
let session_Id = 0;
let categoryFlag = true;//checks tha category ads are rendered the first time
var sId=-1;//chosen subcateroy id
var filteredAds;//ads of the chosen subcategory

let init = {
    method: "GET"
}

//function to throw errors
function throwError(response){
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
}

//fetch to take the categories U.C.1
fetch (url + "/categories", init)
.then(response => {
    throwError(response);
    return response.json();
})
.then(categories => {
    // Loop through each category and fetch subcategories U.C.1
    const categoryPromises = categories.map(category => {
        return fetch(url + "/categories/" + category.id + '/subcategories', init)
            .then(response => {
                throwError(response);
                return response.json();
            })
            .then(subcategories => {
                // Add subcategories to the category object
                category.subcategories = subcategories;
                return category;
            })
            .catch(error => {
                console.error('Error fetching subcategories for category'+ category.id + ':', error);
                return category;
            });
    });

    // Use Promise.all to wait for all subcategory fetch calls to complete
    return Promise.all(categoryPromises);
})
.then(categoriesWithSubcategories => {
    // Compile the Handlebars template
    const source = `
        <ol class="common-list">
            {{#each categories}}
                <div class="category">
                    <h3 class="name">{{title}}</h3>
                    <br>  
                    <a href="category.html?id={{id}}" ><img src = "https://wiki-ads.onrender.com/{{img_url}}" alt='photo'></a>
                    <ul>
                        <br>
                        {{#each subcategories}}
                            <li class="desc"><a href="subcategory.html?id={{id}}" >{{title}}</a></li>
                        {{/each}}
                    </ul>
                </div>
            {{/each}}
        </ol>
    `;

    const template = Handlebars.compile(source);

    // Render the categories data using the template
    const renderedHtml = template({ categories: categoriesWithSubcategories });

    // Display the rendered HTML in the document
    var containerElement = document.getElementById('categories-container');
    if (containerElement !== null){
        containerElement.innerHTML = renderedHtml;
    }
})
.catch(error => {
    console.log('Error fetching categories:', error)
})

//take the id from the url U.C.1
let category_adsId = new URLSearchParams(window.location.search).get('id');

//fetch to take the subcategories of this category for the radio menu Bonus 1
fetch(url + "/categories/" + category_adsId + '/subcategories', init)
.then(response => {
    throwError(response);
    return response.json();
})
.then(subcategories => {
    // Compile the Handlebars template
    const source = `  
    <ul>
        <br>
        <span class="desc">Πατήστε το σύνδεσμο για φιλτράρισμα των αγγελιών με την υποκατηγορία τους:</span><br>
        <form name="choose_sub" >
            <input type="radio" name="sub_radio" data-s-id='-1'>
            <label for="-1" class="desc">Όλα</label><br>
            {{#each subcategories}}
                <input type="radio" name="sub_radio" data-s-id='{{id}}'>
                <label for='{{id}}' class="desc">{{title}}</label><br>
            {{/each}}
        </form>
    </ul>    
    `;

    const template = Handlebars.compile(source);

    // Render the subcategories using the template
    const renderedHtml = template({ subcategories });

    // Display the rendered HTML in the document
    var containerElement = document.getElementById('subcategory_radio');
    if (containerElement !== null){
        containerElement.innerHTML = renderedHtml;
    }
})
.catch(error => {
    console.error('Error fetching subcategories radio'+ category.id + ':', error);
    return category;
});


//fetch to take the ads of this category U.C.1 + Bonus 1
fetch (url + "/ads?category=" + category_adsId, init)
.then(response => {
    throwError(response);
    return response.json();
})
.then(category_ads => {
    logstate = false;//load or reload so user is loged out
    //accessing data attributes for radio buttons
    var choose_sub = document.forms.choose_sub;
    if (choose_sub!=null){

        var radioButtons = choose_sub.elements.sub_radio; // 'sub_radio' is the name attribute
    
        // adding event listeners to radio buttons
        for (var i = 0; i < radioButtons.length; i++) {
            radioButtons[i].addEventListener('change', handleRadioChange);
        }
    } 

    if (categoryFlag){//first time to display category ads
        categoryFlag = false;
        filteredAds=category_ads;
        renderCatAds();
    }

    //event handler function, called every time radio_button is pressed
    function handleRadioChange() {
        sId = this.dataset.sId;//take the subcategory_id

        filteredAds = category_ads.filter(ad => ad.subcategory_id == sId);//find the ads of this subcategory
        
        if (sId==-1){//all ads
            filteredAds=category_ads
        }
        renderCatAds(); 
    }

    //function to display the chosen ads
    function renderCatAds(){
        // Compile the Handlebars template
        const source = `  
            <dl class="dl_ads">
                <ul>
                    {{#each filteredAds}}
                        <dt  class="dt_ads">
                            <br>
                            <li class="name" >{{title}}
                            <button type="button" onclick="favourite('{{id}}')">Προσθήκη</button>
                            </li>
                            <br>
                            <li><img src="https://wiki-ads.onrender.com/{{images.[0]}}" alt="first_photo" ></li>
                            <br>
                            <li class="desc">{{description}}</li>
                            <br>
                            <li class="price">Τιμή:{{cost}}€</li>
                        </dt>
                    {{/each}}
                </ul>
            </dl>        
        `;
    
        const template = Handlebars.compile(source);
    
        // Render the filtered ads using the template
        const renderedHtml = template({ filteredAds });
    
        // Display the rendered HTML in the document
        var containerElement = document.getElementById('category_ads-container');
        if (containerElement !== null){
            containerElement.innerHTML = renderedHtml;
        }
    }
    
})
.catch(error => {
    console.log('Error fetching category_ads:', error)
})


// Register Handlebars helpers
Handlebars.registerHelper('split', function (str) {
    return str.split(';');
});

Handlebars.registerHelper('getFeatureName', function (feature) {
    return feature.split(':')[0].trim();
});

Handlebars.registerHelper('getFeatureValue', function (feature) {
    if (feature.split(':').length == 1){
        return 'Ναι';
    }
    return feature.split(':')[1].trim();
});

//fetch to take the ads of this subcategory U.C.1
fetch (url + "/ads?subcategory=" + category_adsId, init)
.then(response => {
    throwError(response);
    return response.json();
})
.then(subcategory_ads => {
    // Compile the Handlebars template
    const source = `  
        <dl class="dl_ads">
            <ul>
                {{#each subcategory_ads}}
                    <dt  class="dt_ads">
                        <br>
                        <li class="name">{{title}}</li>
                        <li>
                            <div class="flex-container">
                                {{#each images}}
                                    <div><img src="https://wiki-ads.onrender.com/{{this}}" alt="photos"></div>
                                {{/each}}
                            </div>
                        </li>
                        <li class="desc">{{description}}</li>
                        <br>
                        <li class="price">Τιμή:{{cost}}€</li>
                        <br>
                        <li>
                            <table id="char">
                                <thead>
                                    <tr>
                                        <th>Χαρακτηριστικά</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {{#each (split features)}}
                                        {{#if this}}
                                            <tr>
                                                <td>{{getFeatureName this}}</td>
                                                <td>{{getFeatureValue this}}</td>
                                            </tr>
                                        {{/if}}
                                    {{/each}}
                                </tbody>
                            </table>
                        </li>
                    </dt>
                {{/each}}
            </ul>
        </dl>
    `;

    const template = Handlebars.compile(source);

    // Render the subcategories ads using the template
    const renderedHtml = template({ subcategory_ads });

    // Display the rendered HTML in the document
    var containerElement = document.getElementById('subcategory_ads-container');
    if (containerElement !== null){
        containerElement.innerHTML = renderedHtml;
    }
})
.catch(error => {
    console.log('Error fetching category_ads:', error)
})

//function which is called when login button is pressed U.C.2
function submitLoginForm() { 
    //take the inputs
    let usernameInput = document.getElementById('username');
    username = usernameInput.value;
    let passwordInput = document.getElementById('password');
    const password = passwordInput.value;
    
    //fetch to login
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),//give the arguments
    })
    .then(response =>{//handle the response
        if (response.ok) {//ok
            document.getElementById('loginMessage').innerHTML = 'Επιτυχής ταυτοποίηση.';//show message
            passwordInput.classList.remove('error');
            usernameInput.classList.remove('error');
            passwordInput.classList.add('success');//make the inputes green
            usernameInput.classList.add('success');
            logstate = true;//loged in
            return response.json();
        } else {//unaccepted
            document.getElementById('loginMessage').innerHTML = 'Ανεπιτυχής ταυτοποίηση.';//show message
            passwordInput.classList.add('error');//make inputes red
            usernameInput.classList.add('error');
            logstate = false;//loged out
        }
    })
    .then(data => {
        if (data.sessionId) {
            session_Id=data.sessionId;//store the session_id given fron server
        }
    })
    .catch(error => console.error('Σφάλμα:', error));

    passwordInput.reportValidity();
    usernameInput.reportValidity();
}

//function which is called when favourite button is pressed U.C.2
function favourite(ad_id){
    if(logstate){//must be loged in
        const my_ad = filteredAds.find(ad => ad.id == ad_id);//find this ad 
        const title = my_ad.title;//take all the needed infos
        const descr = my_ad.description;
        const cost = my_ad.cost;
        const photo_url = my_ad.images[0];

        //fetch to add this ad to user's favourites
        fetch('/addFavourite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ad_id,title,descr,cost,photo_url, username, session_Id }),//send the infos
        })
        .then(response => {
            if(response.ok || response.status==409){//stored or already stored
                return response.json();
            }
        })
        .then(data => {})
        .catch(error => console.error('Σφάλμα:', error));
    }else{//loged out
        alert('Παρακαλώ συνδεθείτε για προσθήκη στη λίστα αγαπημένων!');
    }

}

//function to show the favourite ads U.C.3
function viewFav(){
    if (logstate){//must be loged in
        window.location.href="favourite-ads.html?username="+username+"&sessionId="+session_Id;
    }else {//loged out
        alert('Παρακαλώ συνδεθείτε για να μεταβείτε στα αγαπημένα!');
    }
}

//take the infos from url
let lUsername = new URLSearchParams(window.location.search).get('username');
let lSessionId = new URLSearchParams(window.location.search).get('sessionId');

if (lUsername != null && lSessionId!=null){
    //fetch to take the favourite ads of user
    fetch('/userFavourites?lUsername='+lUsername+'&lSessionId='+lSessionId, init)
    .then(response => {
        throwError(response);
        return response.json();
    })
    .then(userFavoriteAds => {
        // Compile the Handlebars template
        const source = `  
            <dl class="dl_ads">
                <ul>
                    {{#each userFavoriteAds}}
                        <dt  class="dt_ads">
                            <br>
                            <li class="name">{{title}}</li>
                            <br>
                            <li><img src="https://wiki-ads.onrender.com/{{photo}}" alt="first_photo" class = img_ad> 
                            <br>
                            <li class="desc">{{description}}</li>
                            <br>
                            <li class="price">Τιμή:{{cost}}€</li>
                        </dt>
                    {{/each}}
                </ul>
            </dl>        
        `;

        const template = Handlebars.compile(source);

        // Render the categories data using the template
        const renderedHtml = template({ userFavoriteAds });

        // Display the rendered HTML in the document
        var containerElement = document.getElementById('favourite_ads-container');
        if (containerElement !== null){
            containerElement.innerHTML = renderedHtml;
        }
    })
    .catch(error => console.error('Σφάλμα:', error));
}