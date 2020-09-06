import React from 'react';
import './App.css';
import HomePage from './components/pages/Homepage/HomePage';
import { Route, Switch, Redirect } from 'react-router-dom';
import Shop from './components/pages/Shop/Shop';
import Header from './components/header/Header';
import SignInSignUp from './components/pages/sign-in-sign-up/SignIn-SignUp';
import { auth, createUserProfileDocument, setUserCartData } from './components/firebase/FirebaseUtilities';
import { setCurrentUser } from './redux/user/UserActions';
import { connect } from 'react-redux';
import { selectCurrentUser } from './redux/user/UserSelectors';
import { selectCartItems } from './redux/cart/CartSelectors';
import { createStructuredSelector } from 'reselect';
import Checkout from './components/pages/Checkout/Checkout';
import { setCartItems } from './redux/cart/CartActions';
import toggleCanSave from './redux/save/SaveAction';
import { selectCanSave } from './redux/save/SaveSelector';
import WithSpinner from './components/spinner/WithSpinner';

const CheckoutWithSpinner = WithSpinner(Checkout);
const HomePageWithSpinner = WithSpinner(HomePage);

class App extends React.Component {

  state = {
    loading: true
  }

  unsubscribeFromAuth = null;
  authUser = null;

  componentDidMount() {
    const { setCurrentUser, setCartItems, cartItems, toggleCanSave, canSave } = this.props;
    
    this.unsubscribeFromAuth = auth.onAuthStateChanged(async authUser => {
      this.authUser = authUser;

      if (authUser) {
        const userRef = await createUserProfileDocument(authUser);
        toggleCanSave();
        
        if (canSave) {
          await setUserCartData(authUser, cartItems);
        }

        await userRef.onSnapshot(snapShot => {
          setCurrentUser({
            id: snapShot.id,
            ...snapShot.data()
          });
          setCartItems(snapShot.data().cartItems);
        });
      }
      
      setCurrentUser(authUser);
      this.setState({loading: false});
    });
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth();
  }
  
  render() {
    return (
      <div>
        <Header authUser={this.authUser} />
        <Switch>
          <Route exact render={(props) => <HomePageWithSpinner isLoading={this.state.loading} {...props} />} path='/'/>
          <Route component={Shop} path='/shop'/>
          <Route exact render={(props) => <CheckoutWithSpinner isLoading={this.state.loading} {...props} />} path='/checkout' />
          <Route exact path='/signin' render={() => this.props.currentUser ? (<Redirect to='/' />) : (<SignInSignUp />)}/>
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentUser: selectCurrentUser,
  cartItems: selectCartItems,
  canSave: selectCanSave
});

const mapDispatchToProps = dispatch => ({
  setCurrentUser: user => dispatch(setCurrentUser(user)),
  setCartItems: cartItems => dispatch(setCartItems(cartItems)),
  toggleCanSave: () => dispatch(toggleCanSave())
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
