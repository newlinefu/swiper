let contentJSON = 
`[
	{
		"name": "Three Days Grace",
		"photo":"контент/three-days-grace.1_f.jpg",
		"subs":3500,
		"description":"Three Days Grace — канадская рок-группа, исполняющая альтернативный метал и постгранж. Была сформирована под названием Groundswell в Норвуде, Онтарио, Канада в 1992 году."
	},
	{
		"name":"Thousand Foot Krutch",
		"photo":"контент/31.jpg",
		"subs":6900,
		"description":"Thousand Foot Krutch (сокращенно TFK) — канадская рок-группа. По словам фронтмена группы Тревора МакНивена, название означает тот момент в нашей жизни, когда мы понимаем, что нельзя полагаться только на свои силы."
	},
	{
		"name":"Pyrokinesis",
		"photo":"контент/m1000x1000.jpg",
		"subs":3500,
		"description":"Pyrokinesis – он же Андрей Пирокинезис. Его музыка - это не просто выдуманный образ, а реально прожитые и прочувствованные автором моменты. Он умеет создать атмосферу, которая сразу возникает при прослушивании треков."
	},
	{
		"name":"ГРОБ",
		"photo":"контент/GuVUT8XBArw_d_850.jpg",
		"subs":10000,
		"description":"«Гражданская оборона» — советская и российская рок-группа, основанная 8 ноября 1984 года в Омске Егором Летовым и Константином Рябиновым, наиболее заметная представительница сибирского панк-рока."
	},
	{
		"name":"Horus",
		"photo":"контент/unnamed.jpg",
		"subs": 1300,
		"description":"Денис Луперкаль — один из участников группы Проект Увечье. (прим. Нередко вместе с названием группы приписывают числа 16 13, которые обозначают 16 и 13 буквы латинского алфавита p и m — Project mayhem."
	}
]`;
const swiper = document.getElementById('swiper');

//Класс контента карточек
class Content{
	constructor(name, photo, subs, info) {
		this.name = name;
		this.photo = photo;
		this.subs = subs;
		this.info  = info;
	}
}

//Класс преобразования карточек в различные форматы
class ContentConvertion{
	constructor(content) {
		this.content = content;
	}
	intoJSON() {
		return JSON.stringify(this.content, null, 3);
	}
}

//Генерация пробного контента
function generateArrayOfContent() {
	const arrayOfContent = [];
	for(let item of JSON.parse(contentJSON)) {
		arrayOfContent.push(new Content(item.name, item.photo, item.subs, item.description));
	}
	return arrayOfContent;
}

let getNextContent = controlContent(generateArrayOfContent());
buildTheFrontBlock(getNextContent());
buildTheNextBlock(getNextContent());





function createOneBlock(content) {
	const block = document.createElement('div');
	block.className = 'swiper_item';
	block.innerHTML = 
	`
		<div class="block">
			<div class="wrapper">
				<div class="name">
					${content.name}
				</div>
				<img data-src = ${content.photo} alt = "">
				<div class="subs">
					Подписчиков: <span>${content.subs}</span>
				</div>
				<div class="description">
					Описание: <span>${content.info}</span>
				</div>
			</div>
		</div>
	`;
	giveShapeOfSwiperFrameToBlock(block);
	lazyLoad(block.querySelector('img'));
	return block;
}

//Функция постепенной прогрузки изображений
function lazyLoad(img) {
	img.setAttribute('src', img.getAttribute('data-src'));
	img.onload = function() {
		img.removeAttribute('data-src');
	}
}

function giveShapeOfSwiperFrameToBlock(block) {
	block.style.width = `${swiper.clientWidth}px`;
	block.style.height = `${swiper.clientHeight}px`;
}

//Функция для хранения характеристик массива и для его псевдоинкапуляции. Забирается контент ИЗ КОНЦА
//для увеличения скорости на стороне клиента (предполагается изначальная сортировка на стороне сервера)
function controlContent(arrayOfContent) {

	//Остаток контента (для регуляции подгрузки)
	getContent.balanceOfContent = arrayOfContent.length;
	getContent.allContent = arrayOfContent;

	function getContent(){
		getContent.balanceOfContent--;
		return arrayOfContent.pop();
	}

	return getContent;
}

//Инициализация класса впередистоящего элемента и добавление
//(используется при прогрузке следующего массива, чтобы построить первый элемент)
function buildTheFrontBlock(content) {
	if(content) {
		const buildedBlock = createOneBlock(content);
		buildedBlock.classList.add('front');
		swiper.append(buildedBlock);		
		buildedBlock.addEventListener('mousedown', eventSwipe);
	}
}

//Построение следующего блока. Идет постепенная подгрузка следующего контента
function buildTheNextBlock(content) {
	if(content) {
		const buildedBlock = createOneBlock(content);
		buildedBlock.classList.add('next');
		swiper.append(buildedBlock);		
	}
}

//Удаление старого начального блока, его замена с next, построение нового next
function rebuildBlocks(content) {
	if(content) {
		const deletedElement = document.querySelector('.front');
		deletedElement.removeEventListener('mousedown', eventSwipe);

		//Ожидание улета пролистанного блока за границы экрана, последующее перестроение
		setTimeout(() => {
			deletedElement.remove();
			deletedElement.classList.remove('front');

			const nextElement = document.querySelector('.next');
			nextElement.classList.add('front');
			nextElement.classList.remove('next');
			nextElement.addEventListener('mousedown', eventSwipe);

			buildTheNextBlock(content); 
		}, 400);
	}
}

//callback, передаваемый слушателю события пролистывания свайпера
function eventSwipe(event) {

	const targetOfEvent = event.target.closest('.front');

	targetOfEvent.style.transition = 'none';

	//Координаты начального клика относительно верхнего левого угла блока свайпера
	const startXClick = event.clientX - swiper.getBoundingClientRect().left;
	const startYClick = event.clientY - swiper.getBoundingClientRect().top;

	//Координаты начального клика относительно окна
	const startXClient = event.clientX;
	const startYClient = event.clientY;

	//Определение, где был совершен клик, чтобы двигать элемент в той же его точке
	const biasX = event.clientX - swiper.getBoundingClientRect().left;
	const biasY = event.clientY - swiper.getBoundingClientRect().top;

	//Если курсор выше половины высоты => поворот против часовой (и наоборот)
	const sign = startYClient >= swiper.getBoundingClientRect().top + swiper.offsetHeight/2 ? 1 : -1;

	swiper.addEventListener('mousemove', mouseMove);

	function mouseMove(event) {

		//Новые координаты относительно блока свайпера
		const actualCoordX = event.clientX - swiper.getBoundingClientRect().left - biasX;
		const actualCoordY = event.clientY - swiper.getBoundingClientRect().top - biasY;

		//Рассчет поворота угла, исходя из разницы в координатах X
		const rotate = sign*(startXClient - event.clientX)*0.15;

		targetOfEvent.style.transform = `rotate(${rotate}deg)`;

		//Перемещение элемента в указанные координаты
		targetOfEvent.style.left =  `${actualCoordX}px`;
		targetOfEvent.style.top =  `${actualCoordY}px`;

		event.preventDefault();
	}

	swiper.onmouseup = resultOfSwipe;

	//Если курсор ушел со слайдера, то считается, что пользователь отпустил мышь и совершаем аналогичное
	//поднятию курсора действие
	swiper.onmouseout = function(event) {
		if(event.target.closest('.swiper') && (!event.relatedTarget || !event.relatedTarget.closest('.swiper'))){
			resultOfSwipe(event);
		}
	}

	//Функция обработки результата свайпа
	function resultOfSwipe(event) {

		//Пролистывание блока, если произошло смещение на определенный порог, иначе возращение в исходное состояние
		if(Math.abs(event.clientX - startXClient) >= swiper.offsetWidth*0.4){

			//Определение в какую сторону должен улететь блок
			const scroll = event.clientX - startXClient <= 0 ? -250 : 250 + swiper.offsetWidth/2;

			//Плавное перемещение блока за границы экрана
			targetOfEvent.style.transition = '0.4s';
			targetOfEvent.style.left = `${scroll}px`;

			changeBlocks(event);
		}
		else
			bringToStart();

		//Чистка событий
		swiper.removeEventListener('mousemove', mouseMove);
		swiper.onmouseup = null;
		swiper.onmouseout = null;
	}

	//Плавное возвращение элемента в исходное состояние (если свайп не произошел)
	function bringToStart() {
		targetOfEvent.style.transition = '0.6s';
		targetOfEvent.style.transform = 'none';
		targetOfEvent.style.left = '0';
		targetOfEvent.style.top = '0';
	}

	//Подгрузка новых блоков при смене элемента
	function changeBlocks(event) {
		if(getNextContent.balanceOfContent <= 3){
			getNextContent = controlContent(generateArrayOfContent().concat(getNextContent.allContent));
		}
		rebuildBlocks(getNextContent());	
	}
}

