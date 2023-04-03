"use strict";

// getting all required HTML elements
let container = document.getElementById("container");
let search_box = document.getElementById("search_box");
let main = document.getElementById("main");

let favourite_btn = document.getElementById("favourite_btn");
let fav_exit = document.getElementById("EXIT");
let fav_body = document.getElementById("fav_body");

// will contain all cards added in FAV section
let heart = [];
let view = 0;
let btn_array = [];

//setting array to store all meals id in FAV section
if (localStorage.getItem("meals_id_array") === null) {
    let meals_id = [];
    localStorage.setItem("meals_id_array", JSON.stringify(meals_id));
}

//creating an array for storing data/cards
let object_array = [];

//creating show alert function
function show_alert(text) {
    alert(text);
}

//add event listener to the search box to listen for keys & for each hit we will be getting relevant recepies
search_box.addEventListener("keyup", find_Recipes);

// fetch food data from API
function find_Recipes() {
    let search_value = search_box.value;
    // get request with query param having text from searchbar
    fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + search_value)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data);
            // copying the fetched data
            object_array = data;
            // displaying created cards in main section
            render_cards(object_array);
        })
        .catch(function () {
            // in case no results are displayed, show error message
            main.innerHTML = `<div id="error1">
                <p>❗❗ No recipe matching your search ❗❗</p>
            </div>`;
        })
}

 // calling append_cards functions for each next-char search 
function render_cards(object_array) {
    // clearing old cards first
    main.innerHTML = "";
    let length = object_array.meals.length;
    for (let i = 0; i < length; i++) {
        append_cards(object_array.meals[i]);
    }
}

// adding cards in main section via creating CARD elements
let card_btn_array = [];
let index = 0;
function append_cards(object) {
    let mealCard = document.createElement("div");
    mealCard.classList.add("food_card");
    mealCard.innerHTML = `
        <div class="card_img_div">
            <img class="card_img" src = "${object.strMealThumb}"/>
        </div >
        <p class="card_text_para">${object.strMeal}</p>
        <div class="card_lower_div">
            <button id="${object.idMeal}" class="btn">RECIPE</button>
            <span id="${object.idMeal}1" class="material-symbols-sharp"> favorite </span> 
        </div>`;
    // appending '1' for each meal id makes a unique id for heart icon of that meal_id
    // adding to main section
    main.append(mealCard);

    //  setting rendered card heart icon red of they are available in local storage
    let mls_id = JSON.parse(localStorage.getItem("meals_id_array"));
    for (let i = 0; i < mls_id.length; i++) {
        if (mls_id[i].idMeal === object.idMeal) {
            let HEART_ID = `${object.idMeal}1`;
            let element = document.getElementById(HEART_ID);
            element.style.color = "red";
        }
    }

    // getting & adding eventlistner for each card view button
    card_btn_array[index] = document.getElementById(`${object.idMeal}`);
    card_btn_array[index].addEventListener("click", Recipe_container);

    // getting & adding eventlistners for each card heart button
    heart[index] = document.getElementById(`${object.idMeal}1`);
    heart[index].addEventListener("click", add_to_fav);
    
    //goto next card
    index++;
}

// adding recipes card to favourite section on clicking heart button
function add_to_fav(event) {
    // search in local storage if it is pre existing in local storage
    let mls_id = JSON.parse(localStorage.getItem("meals_id_array"));
    for (let i = 0; i < mls_id.length; i++) {
        // removing '1' added from heart_id to get meal_id
        if ((event.target.id).slice(0, -1) === mls_id[i].idMeal) {
            show_alert("❕❕Meal Recipe already exists in FAV list❕❕");
            return;
        }
    }
    // if not in local storage, find card 
    mls_id = mls_id.concat(object_array.meals.filter(function (object) {
        // removing '1' added from heart_id to get meal_id
        return object.idMeal === (event.target.id).slice(0, -1);
    }));
    // adding to local storage
    localStorage.setItem("meals_id_array", JSON.stringify(mls_id));
    
    // creating & rendering card for fav section for newly added element in local storage
    localStorage_fetch();
    show_alert("❕❕Meal Recipe added to FAV list SUCCESSFULLY❕❕");

    // adding red color to heart
    (event.target).style.color = "red";
}

// function for view Recipe of card rendered 
function Recipe_container(event) {
    
    // if recipe is already open
    if (btn_array.includes(event.target.id) === true) {
        show_alert("❕❕Meal recipe is already open❕❕");
    }
    else {
        // pusing meal_id to btn_arr & getting respective meal_id of card
        btn_array.push(event.target.id);
        view++;
        main.style.visibility = "hidden"; // OR main.innerHTML = "";
        // filter_array have 1 object whose meal id match with button target id
        let filter_array = object_array.meals.filter(function (object) {
            return object.idMeal === event.target.id;
        });

        // creating & overlapping it in div already containg nav & header & main section
        let Recipe_div = document.createElement("div");
        Recipe_div.classList.add("Recipe_card");
        Recipe_div.innerHTML = `    
        <div id="left">
            <div id="left_upper">
                <img id="left_upper_img"src="${filter_array[0].strMealThumb}" alt="error">
                <p id="left_upper_p1">${filter_array[0].strMeal}</p>
                <p id="left_upper_p2">Cuisine : ${filter_array[0].strArea}</p>
            </div>
            <div id="left_lower">
                <a href="${filter_array[0].strYoutube}" target="_blank"><button id="left_lower_btn">YOUTUBE</button></a>
            </div>
        </div>

        <div id="right">
            <span id="${(event.target.id)}5" class="cross material-symbols-outlined delete-sign">❌</span>
            <h3 id="right_inst">INSTRUCTIONS</h3>
            <p id="right_p">${filter_array[0].strInstructions}</p>
        </div>`;

        container.append(Recipe_div);

        // finding & adding eventlistner to cross button of view page
        let cross = document.getElementsByClassName("cross");
        cross[0].addEventListener("click", exit_page);
    }
}

// on clicking cross button  deleting div added to container before, on view button click 
function exit_page(event) {
    const index = btn_array.indexOf(event.target.id.slice(0, -1));
    btn_array.splice(index, 1);
    view--;
    let recipes_container_div = document.getElementsByClassName("Recipe_card");
    recipes_container_div[recipes_container_div.length - 1].remove();

    if (view === 0) {
        main.style.visibility = "visible";
    }
}

// onclicking favourite button of nav section
favourite_btn.addEventListener("click", fav_page);

function fav_page() {
    //reducing brightness of container having nav/ header/ main section
    container.style.filter = "brightness(70%)";
    let favourite_container = document.getElementById("favourite_container");
    favourite_container.style.right = "0vw";
    
    // adding event listner to cross button of fav section
    fav_exit.addEventListener("click", EXIT);

    function EXIT() {
        favourite_container.style.right = "-360px";
        container.style.filter = "brightness(100%)";
    }

    // updating & rendering elements from local storage to fav section
    localStorage_fetch();
}

// fetch local storage for creating & rendering cards added to local storage
function localStorage_fetch() {
    let localStorage_length = JSON.parse(localStorage.getItem("meals_id_array")).length;
    let meals_id_array = JSON.parse(localStorage.getItem("meals_id_array"));

    // if no cards added, then show error message
    if (localStorage_length === 0) {
        fav_body.innerHTML = "<h2>❕❕No recipes here...❕❕</h2>";
    }
    else {
    // clear fav section & render all added elements
        fav_body.innerHTML = "";
        for (let i = 0; i < localStorage_length; i++) {
            //setting card in fav div
            let mealCard = document.createElement("div");
            mealCard.classList.add("food_card");
            mealCard.innerHTML = `
            <div class="card_img_div">
                <img class="card_img" src = "${meals_id_array[i].strMealThumb}"/>
            </div>

            <p class="card_text_para">${meals_id_array[i].strMeal}</p>
            <div class="card_lower_div_fav">
                <button id="${meals_id_array[i].idMeal}2" class="btn1">VIEW</button>
                <button id="${meals_id_array[i].idMeal}3" class="btn1">DEL</button>
            </div>`;

            //add 2 in id = ${object.idMeal}'2', to make unique id for view button for each card in fav section
            //add 3 in id = ${object.idMeal}'3', to make unique id for delete button for each card in fav section
            fav_body.append(mealCard);

            // getting & adding eventlistneres for card view btn
            card_btn_array[index] = document.getElementById(`${meals_id_array[i].idMeal}2`);
            card_btn_array[index].addEventListener("click", Recipe_container1);

            // getting & adding eventlistneres for card remove btn
            heart[index] = document.getElementById(`${meals_id_array[i].idMeal}3`);
            heart[index].addEventListener("click", remove_from_fav);
            index++;
        }
    }
}

// view recipe of fav section cards, similar to recipe container of cards rendered on main section
function Recipe_container1(event) {

    if (btn_array.includes((event.target.id).slice(0, -1)) === true) {
        show_alert("❗❗ Your Meal Recipe is already open ❗❗");
    }
    else {
        btn_array.push((event.target.id).slice(0, -1));
        view++;
        main.style.visibility = "hidden";
        let filter_array = JSON.parse(localStorage.getItem("meals_id_array")).filter(function (object) {
            return object.idMeal === (event.target.id).slice(0, -1);
        });

        let Recipe_div = document.createElement("div");
        Recipe_div.classList.add("Recipe_card");
        Recipe_div.innerHTML = `    
        <div id="left">
            <div id="left_upper">
                <img id="left_upper_img"src="${filter_array[0].strMealThumb}" alt="error">
                <p id="left_upper_p1">${filter_array[0].strMeal}</p>
                <p id="left_upper_p2">Cuisine : ${filter_array[0].strArea}</p>
            </div>
            <div id="left_lower">
                <a href="${filter_array[0].strYoutube}" target="_blank"><button id="left_lower_btn">Watch Video</button></a>
            </div>
        </div>

        <div id="right">
            <span id="${(event.target.id).slice(0, -1)}4" class="cross material-symbols-outlined delete-sign">❌</span>
            <h3 id="right_inst">INSTRUCTIONS</h3>
            <p id="right_p">${filter_array[0].strInstructions}</p>
        </div>`;

        container.append(Recipe_div);
        let cross = document.getElementsByClassName("cross");
        for (let i = cross.length - 1; i >= 0; i--) {
            cross[i].addEventListener("click", exit_page);
        }
    }
}

// removing recipes card FAV section

function remove_from_fav(event) {
    // serching & updating local storage with card removed from fav section
    let mls_id = JSON.parse(localStorage.getItem("meals_id_array"));
    for (let i = 0; i < mls_id.length; i++) {
        if (mls_id[i].idMeal === event.target.id.slice(0, -1)) {
            mls_id.splice(i, 1);
        }
    }

    // updating & re rendering cards from local storage
    localStorage.setItem("meals_id_array", JSON.stringify(mls_id));
    localStorage_fetch();
    show_alert("❕❕Meal Recipe removed from FAV list SUCCESSFULLY❕❕");

    // removing red color from cards rendered in main section
    let HEART_ID = event.target.id.slice(0, -1) + 1; 
    let element = document.getElementById(HEART_ID);
    // if the element is still on the page
    if (element !== null) {
        element.style.color = "black";
    }
}


