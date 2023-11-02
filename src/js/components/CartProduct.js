import { select } from "../settings.js";
import AmountWidget from "./AmountWidget.js";

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
    thisCartProduct.params = menuProduct.params;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

  }
  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    thisCartProduct.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
  }
  initAmountWidget(){
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', () =>{
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
    });
    thisCartProduct.dom.price.innerHTML = thisCartProduct.priceSingle;
  }
  initActions(){
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();

    });
    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

      console.log('działa');
    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }
  getData(){
    const thisCartProduct = this;
    const data = {};
    data.id = thisCartProduct.id;
    data.amount = thisCartProduct.amount;
    data.price = thisCartProduct.price;
    data.name = thisCartProduct.name;
    data.params = thisCartProduct.prepareOrderProductParams();

    return data;
  }
  prepareOrderProductParams(){
    const thisCartProduct = this;
    const params = {};
    const thisParams = thisCartProduct.params;
    for(const param in thisParams){
      params[param] = [];
      const options = thisParams[param].options;
      for(const option in options){
        params[param].push(option);
      }
    }
    return params;
  }
  
}

export default CartProduct;