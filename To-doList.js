const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector('#todo-list');
const savedWeatherData = JSON.parse(localStorage.getItem('saved-weather'));

const savedTodoList = JSON.parse(localStorage.getItem('saved-items'));



const speech = new webkitSpeechRecognition;

document.getElementById("voiceStart").addEventListener("click", () => {
    speech.start();
});

speech.addEventListener("result", (event) => {
    const speech = event.results[0][0].transcript;
    
    console.log(speech.substr(0,3));
    if(speech.substr(0,3) === "할 일"){
        // createTodo(speech);
        const speechResult = speech.split("할 일 ");
        createTodo(speechResult[1]);
    }else if(speech.substr(0,2) === "체크"){
        // createTodo(speech);
        const speechResult = speech.split("체크 ");
        checkItem(speechResult[1]);
    }else if(speech.substr(0,3) === "없애기"){
        // createTodo(speech);
        const speechResult = speech.split("없애기 ");
        deleteItem(speechResult[1]);
    }
});


const createTodo = (storageData) => {
    
    let todoContents;
    console.log(typeof(storageData));
    if(typeof(storageData) === 'string'){ //stroageData가 음성으로 들어온 데이터 일때
        todoContents = storageData;
        console.log(todoContents);
    }else{
        todoContents = todoInput.value;
    }
    console.log(todoContents);
    

    if(storageData && typeof(storageData) !== 'string'){
        todoContents = storageData.contents;
    }

    
    const newLi = document.createElement('li');
    const newSpan = document.createElement('span');
    const newBtn = document.createElement('button');

    newBtn.addEventListener('click',() => {
        
        newLi.classList.toggle('complete');
        saveItem();
    });

    newLi.addEventListener('dblclick',() => {
        newLi.remove();
        saveItem();
    });

    if(storageData?.complete){
        newLi.classList.add('complete');
    }

    newSpan.textContent = todoContents;
    newLi.appendChild(newBtn);
    newLi.appendChild(newSpan);
    todoList.appendChild(newLi);
    todoInput.value = ""; 
    saveItem();
}

const KeyCodeCheck = function () {
    

    if(window.event.keyCode === 13 && todoInput.value.trim() !== ""){  
        createTodo();
    }
}

const deleteItem = (Item) =>{
    const liList = document.querySelectorAll('li');
    for(let i=0; i<liList.length;i++){
        if(liList[i].innerText === Item){
            liList[i].remove();
            saveItem();
        }
    }
}

const checkItem = (Item) =>{
    const liList = document.querySelectorAll('li');
    for(let i=0; i<liList.length;i++){
        if(liList[i].innerText === Item){
            liList[i].classList.toggle('complete');
            console.log(Item);
        }
    }
}

const deleteAll = () =>{
    const liList = document.querySelectorAll('li');
    for(let i=0; i<liList.length;i++){
        liList[i].remove();
        saveItem();
    }
}

const saveItem = () =>{
    const saveItems = [];


    for(let i=0; i<todoList.children.length;i++){
        const todoObj = {
            contents : todoList.children[i].querySelector('span').textContent,
            complete : todoList.children[i].classList.contains('complete')
        }
        saveItems.push(todoObj);
    }
    
    saveItems.length === 0 
    ? localStorage.removeItem('saved-items') 
    : localStorage.setItem('saved-items',JSON.stringify(saveItems));
    
}

if(savedTodoList){
    console.log(savedTodoList[0]);
    for(let i=0; i<savedTodoList.length;i++){
        createTodo(savedTodoList[i]);
    }
}

const weatherDataActive = function ({ location, weather }) {
    const weatherMainList = [
        'Clear',
        'Clouds',
        'Drizzle',
        'Rain',
        'Snow',
        'Thunderstorm'
    ];
    
    weather = weatherMainList.includes(weather) ? weather : 'Fog';
    const locationNameTag = document.querySelector('#location-name-tag');
    locationNameTag.textContent = location;
    
    document.body.style.backgroundImage = `url('./img/${weather}.jpg')`;

    if(!savedWeatherData||savedWeatherData.location !== location || savedWeatherData.weather !== weather) {
        localStorage.setItem('saved-weather', JSON.stringify({ location, weather }));
    }

}

const weatherSearch = ({ latitude, longitude}) => {
    fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=92b7a30a49fe89ba492785bc4a3b42e6`
    ).then((res)=>{
        return res.json();
    }).then((json) => {
        console.log(json.name, json.weather[0].main);
        const weatherData = {
            location : json.name,
            weather : json.weather[0].main
        }
        weatherDataActive(weatherData);
    })
    .catch((err)=>{
        console.error(err);
    })
    
    
}

const accessToGeo = ({coords}) => {

    const { latitude, longitude } = coords
    const positionObj = {
        latitude,
        longitude
    };

    weatherSearch(positionObj);
}

const askForLocation = () => {
    navigator.geolocation.getCurrentPosition(accessToGeo, (err) =>{
        console.log(err);
    });
}

askForLocation();

if(savedWeatherData) {
    weatherDataActive(savedWeatherData);
 }


// if(!("webkitSpeechRecognition" in window)){
//     alert("크롬만 지원 가능합니다.");
// }else{
//     const speech = new webkitSpeechRecognition;

//     document.getElementById("voiceStart").addEventListener("click", () => {
//         speech.start();
//     });

//     speech.addEventListener("result", (event) => {
//         console.log(event.results[0][0].transcript);
//     });
// }