function register() {

    mode = document.getElementById("mode").value;
    description = document.getElementById("description").value;
    amount = document.getElementById("amount").value;

    if (mode || amount || description != "") {
        console.log('Muito bem!')
    } else {
        console.log("Você precisa preencher os campos")
        Toasty();



    }
    console.log(mode)
    console.log(description)
    console.log(amount)
}
var option =
{
    animation: true,
    delay: 1000
};

function Toasty() {
    var toastHTMLElement = document.getElementById('alert');

    var toastElement = new bootstrap.Toast(toastHTMLElement, option);

    toastElement.show();
}

