
// !IMPORTANT: REPLACE WITH YOUR OWN CONFIG OBJECT BELOW

// Initialize Firebase
var config = {
	apiKey: "AIzaSyBmGlVK1P-fTw_RvFaA9tV1pEv8-Rk_-z4",
	authDomain: "thinksalon-2021.firebaseapp.com",
	databaseURL: "https://thinksalon-2021-default-rtdb.firebaseio.com",
	projectId: "thinksalon-2021",
	storageBucket: "thinksalon-2021.appspot.com",
	messagingSenderId: "892004428811",
	appId: "1:892004428811:web:805e7e85048e791af6eb0e",
	measurementId: "G-YE9WY5Z6ZS"
};

firebase.initializeApp(config);

// Firebase Database Reference and the child
// firebase의 database를 참조하기
const db = firebase.database()
// firebase/database의 'Test' [질문,공부] ID? key값?을 참조하기 - Array에 대한 더 명확한 공부 필요
const usersRef = db.ref("Test")

// [삭제예정] 아래의 용도에 대해서 아직 명확하게 파악이 되지 않음
// usersRef.on("value", snap => {
//	snap.forEach(childSnap => {
//		//console.log("childSnap=", childSnap.val());
//		let key = childSnap.key;
//		let value = childSnap.val();
//		data_usersRef[key] = value;
//	})
// })

//파이어베이스 데이터베이스에서 유저의 키값과 벨류값을 on하기
//아래함수 풀어쓰기: firebase.database().ref("Test/" + userName + "/").on()

function readData() {

	//index.html에서 userName의 value값을 불러옴
	//[질문] index.html이 로딩될 때, 
	const userName = document.getElementById('userName').value

	if(Boolean(userName)) {	

		const userRef = db.ref("Test/" + userName + "/")
		
		//on()에 대한 이해: https://kdinner.tistory.com/72
		//on은 Read에 대한 메소드 
		userRef.on('value', (snapshot) => {

			//[질문] data 묶기, {}, [] 같은가? value 값만 가져오기
			var data = Object.values(snapshot.val());
			//console.log('data[].key=', data[0].date)

			//Keys 값만 가져오기
			var onKeys = Object.keys(snapshot.val());
			//console.log('onKeys=', onKeys)

			console.log('data2=', data)

			// html에 최근 값 적기
			document.getElementById('latestDate').innerHTML = '날짜 불러오기';
			console.log('latestDate=', data[onKeys.length-1].date);
			document.getElementById('date').value = data[onKeys.length-1].date;
			document.getElementById('direction').innerHTML = data[onKeys.length-1].direction;
			document.getElementById('naviA').innerHTML = data[onKeys.length-1].naviA;
			document.getElementById('naviB').innerHTML = data[onKeys.length-1]['naviB']; // 이렇게 해도 됨.
			document.getElementById('action').innerHTML = data[onKeys.length-1].action;	

			// dateArray에 date 넣기
			var dateArray = [];

			console.log('onKeys.length=', onKeys.length)

			for(k=0; k < onKeys.length; k++) {

				dateArray.push(data[k].date);

			};

			console.log('dateArray=', dateArray)
			//  Array에서 select 목록 만들기 - 참고 링크: https://www.youtube.com/watch?v=HMehtL39VUQ
			var dateArrayList = document.getElementById("dateSelectBox"),
								dateArray;
				
			for(var j = 0; j < dateArray.length; j++) {
				var option = document.createElement("OPTION"),
					txt = document.createTextNode(dateArray[j]);
				option.appendChild(txt);
				option.setAttribute("value", dateArray[j]);
				dateArrayList.insertBefore(option,dateArrayList.lastChild);
			}

		});

			//userName프로세스가 잘 작동했음을 확인하는 표식
			var readDateWorked = "Y";
			console.log('readDateWorked=' , readDateWorked)

	} else {

		alert('[이름]을 입력해주시기 바랍니다.');

	}

};

// 선택한 날짜에 맞춰서 내용 집어넣기

function selectDate() {

	//날짜 선택하기
	var selectedDateValue = document.getElementById("dateSelectBox").value;
	console.log('selectedDateValue=', selectedDateValue);

	const userName = document.getElementById('userName').value
	const userRef = db.ref("Test/" + userName + "/")
		
	userRef.on('value', (snapshot) => {

		var data = Object.values(snapshot.val());
		var onKeys = Object.keys(snapshot.val());

		//선택된 날짜에 맞춰서 값 Select하기
		for(i=0; i < onKeys.length; i++) {

			if (data[i].date === selectedDateValue) {
				document.getElementById('date').value = data[i].date;
				document.getElementById('direction').innerHTML = data[i].direction;
				document.getElementById('naviA').innerHTML = data[i].naviA;
				document.getElementById('naviB').innerHTML = data[i]['naviB']; // 이렇게 해도 됨.
				document.getElementById('action').innerHTML = data[i].action;
			} else {
				
			}
		};
	});
}	

	//[질문] data를 {}로 묶는 것과 []로 묶는 것의 차이
	//새로 적용한 것은 []로 묶이게된다.
	//var data = Object.values(snapshot.val());

// let data{}를 var data = Object.values(snapshot.val()); 로 변경
//-----여기부터-----
//	let data = {}

//	const userName = document.getElementById('userName').value
//	const userRef = db.ref("Test/" + userName + "/")

//	userRef.on("value", snap => {
//		snap.forEach(childSnap => {
//			let key = childSnap.key;
//			let value = childSnap.val();
//			data[key] = value;
//		});
//

//		console.log('data=', data)

//		for(i=0; i < data[0].date.length - 1; i++) {

//			if (data[i].date === selectedDateValue) {
				//document.getElementById('date').value = data[i].date;
//				document.getElementById('direction').innerHTML = data[i].direction;
//				document.getElementById('naviA').innerHTML = data[i].naviA;
//				document.getElementById('naviB').innerHTML = data[i]['naviB']; // 이렇게 해도 됨.
//				document.getElementById('action').innerHTML = data[i].action;
//			} else {
				
//			}
//		};

//	});
//};
//	-----여기까지----


// 버튼 클릭 시 데이터를 수정하기. *주의 신규입력 아님.
// function onUpdate() {
//	let updatedData = {}
//	updatedData['date'] = document.getElementById('date').value;
//	updatedData['direction'] = document.getElementById('direction').value;
//	updatedData['naviA'] = document.getElementById('naviA').value;
//	updatedData['naviB'] = document.getElementById('naviB').value;
//	updatedData['action'] = document.getElementById('action').value;

//	const userName = document.getElementById('userName').value;

//	var onKeys = Object.keys(snapshot.val());
	
	//기존에 있던 원소의 갯수 새기
//	for(i=0; i < onKeys.length; i++) {
//		console.log(data[i].length);
//	};

	//for(j=0; j < 2; j++) {
	//	const usersRefParent = db.ref("Test/" + userName + "/" + j)
	//	var updatedDataArray = []
		//const userRef = db.ref("users/" + userName)
	//	usersRefParent.update(updatedData);
	//	console.log(usersRefParent.update(updatedData))
		//console.log(usersRefParent.updatedDataArray.update(updatedData))
	//}
	
//	alert("saved.");
//	//location.reload();
//};

function onUpdate() {
	let updatedData = {}
	updatedData['date'] = document.getElementById('date').value;
	updatedData['direction'] = document.getElementById('direction').value;
	updatedData['naviA'] = document.getElementById('naviA').value;
	updatedData['naviB'] = document.getElementById('naviB').value;
	updatedData['action'] = document.getElementById('action').value;


	const userName = document.getElementById('userName').value;

	//[Todo] 고민할것 참고: https://kdinner.tistory.com/72
	const userRef = db.ref("Test/"+ userName + '/' +  + '/')

	userRef.update(updatedData);
	alert("saved.");

};

function onNewSave() {

	let newData = {}
	newData['date'] = document.getElementById('date').value
	newData['direction'] = document.getElementById('direction').value
	newData['naviA'] = document.getElementById('naviA').value
	newData['naviB'] = document.getElementById('naviB').value
	newData['action'] = document.getElementById('action').value

	const usersRef = db.ref("Test")

	let userName = document.getElementById('userName').value
	usersRef.child(userName)
		//parent를 만들지 못하다가 push의 솔루션을 찾게됨
		.push(newData);
		//.set(newData);
}

// 신규 버튼과 수정 저장 관계 - CRUD 참고해보기 / 삭제도 필요
// var selectorOnNew = document.getElementById('onNew')
//console.log('1=', selectorOnNew.value);

//다크모드
function darkmode() {
	var selectorBody = document.querySelector('body')
	var selectorDarkMode =  document.getElementById('darkMode')
	var selectorGridIndex =  document.getElementById('gridIndex')
	var selectorContentsSave = document.getElementById('contentsSave')
	if(selectorDarkMode.value === '다크모드 켜기') {
		selectorBody.style.backgroundColor = '#1E1E1E';
		selectorBody.style.color = 'white';
		selectorDarkMode.value = '다크모드 끄기';
	
		var alist = document.querySelectorAll('a');
		var i = 0;
		while(i < alist.length) {
			alist[i].style.color = 'powderblue';
			i = i + 1;
		}
	
		selectorGridIndex.style.backgroundColor = '#333333';
		selectorContentsSave.style.backgroundColor = '#333333';
	
	} else {
		selectorBody.style.backgroundColor = 'white';
		selectorBody.style.color = 'black';
		selectorDarkMode.value = '다크모드 켜기';
	
		var alist = document.querySelectorAll('a');
		var i = 0;
		while(i < alist.length) {
			alist[i].style.color = 'blue';
			i = i + 1;
		}
	
		selectorGridIndex.style.backgroundColor = 'rgb(240, 240, 240)';
		selectorContentsSave.style.backgroundColor = 'rgb(240, 240, 240)';
	
	}
}

// [to do] memo
// tectbox를 읽기용으로 바꾸기
// Action을 to do list로 만들기