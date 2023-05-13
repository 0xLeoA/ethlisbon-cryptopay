
// cryptopay url 
cryptopayurl = "http://localhost:3000"
// define url with parameters
let url = `http://localhost:3000/completepayment?address=${your_address}&amount=${payment_amount}&destinationChainid=${destination_chainid}`
// prompt user to complete payment 
const newWindow = window.open(url)

// start listening for confirmation from cryptopay
window.addEventListener('message', (event) => {
    if (event.origin == cryptopayurl) {
        console.log(event.data)
        if (event.data == 'Success: Payment Complete') {
            // add your payment completion logic
        }
    }
});

