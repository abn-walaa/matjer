let btn = document.querySelector('header .mob')
let nav = document.querySelector('header .nav')
let active = document.querySelector('header .nav.active')
btn.onclick = () => {
    nav.classList.toggle('active')
}

addEventListener('click', (e) => {
    if (e.target.classList[1] === "active") {
        nav.classList.toggle('active')
    }

})