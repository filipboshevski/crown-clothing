import React from 'react';
import HomePage from './components/pages/Homepage/HomePage';
import { Route, Switch, Redirect } from 'react-router-dom';
import Shop from './components/pages/Shop/Shop';
import Header from './components/header/Header';
import SignInSignUp from './components/pages/sign-in-sign-up/SignIn-SignUp';
import { connect } from 'react-redux';
import { selectCurrentUser } from './redux/user/UserSelectors';
import { selectCartItems } from './redux/cart/CartSelectors';
import { createStructuredSelector } from 'reselect';
import Checkout from './components/pages/Checkout/Checkout';
import { setCartItems } from './redux/cart/CartActions';
import toggleCanSave from './redux/save/SaveAction';
import { selectCanSave, selectIsLoading } from './redux/save/SaveSelector';
import WithSpinner from './components/spinner/WithSpinner';
import { signInSuccess, isUserPersisted } from './redux/user/UserActions';
import GlobalStyles from './GlobalStyles';

const CheckoutWithSpinner = WithSpinner(Checkout);
const HomePageWithSpinner = WithSpinner(HomePage);
const SignInSignUpWithSpinner = WithSpinner(SignInSignUp);

class App extends React.Component {
  
  componentDidMount() {
    const { cartItems, canSave, isUserPersisted, isLoading } = this.props;
    isUserPersisted(canSave, isLoading, cartItems);
  }

  render() {
    const { isLoading } = this.props;
    return (
      <div>
        <GlobalStyles />
        <Header authUser={this.authUser} />
        <Switch>
          <Route exact render={(props) => <HomePageWithSpinner isLoading={isLoading} {...props} />} path='/'/>
          <Route component={Shop} path='/shop'/>
          <Route exact render={(props) => <CheckoutWithSpinner isLoading={isLoading} {...props} />} path='/checkout' />
          <Route exact path='/signin' render={(props) => this.props.currentUser ? (<Redirect to='/' />) : (<SignInSignUpWithSpinner isLoading={isLoading} {...props} />)}/>
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser,
  cartItems: selectCartItems,
  canSave: selectCanSave,
  isLoading: selectIsLoading
});

const mapDispatchToProps = dispatch => ({
  setCartItems: cartItems => dispatch(setCartItems(cartItems)),
  toggleCanSave: () => dispatch(toggleCanSave()),
  signInSuccess: authUser => dispatch(signInSuccess(authUser)),
  isUserPersisted: (canSave, loading, cartItems) => dispatch(isUserPersisted(canSave, loading, cartItems))
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
