import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { removeFromCart, clearCart } from 'src/store/apps/cart';
import { PayPalButtons } from '@paypal/react-paypal-js';

const Cart = () => {
  const cartItems = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [alertMessage, setAlertMessage] = React.useState('');
  
  
  
  
  const handleClearCart = () => {
    dispatch(clearCart());
    setAlertMessage('Cart cleared');
  };

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, product) => total + product.price, 0);
  };

  const calculateGST = () => {
    const totalPrice = calculateTotalPrice();
    const gstPercentage = 0.18; // Example GST rate (18%)
    return totalPrice * gstPercentage;
  };

  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart({ id: productId }));
    setAlertMessage('Product removed from Cart');
    setPaypalAmount(calculateTotalPrice() + calculateGST());
  };

    const [paypalAmount, setPaypalAmount] = useState(calculateTotalPrice() + calculateGST());
  return (
    <div>
      <h2>Cart</h2>
      <Snackbar
        open={alertMessage !== ''}
        message={alertMessage}
        autoHideDuration={1000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setAlertMessage('')}
      />
      {cartItems && cartItems.length > 0 ? (
        <>
        <Button
      variant="contained"
      color="primary"
      onClick={handleClearCart}
      style={{ marginBottom: '20px' }}
    >
      Clear Cart
    </Button>
        <Grid container spacing={2}>
          {cartItems.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card style={{height:"350px"}}>
                <CardMedia
                  component="img"
                  alt={product.title}
                  height="140"
                  image={product.thumbnail}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {product.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Price: ${product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRemoveFromCart(product.id)}
                  >
                    Remove from Cart
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <h2>Pricing</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>GST (18%)</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>${calculateTotalPrice().toFixed(2)}</TableCell>
                  <TableCell>${calculateGST().toFixed(2)}</TableCell>
                  <TableCell>${(calculateTotalPrice() + calculateGST()).toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
           <Button
              variant="contained"
              color="primary"
              style={{ marginTop: '20px' }}
            >
              <PayPalButtons
                style={{ layout: 'horizontal' }}
                createOrder={(data, actions) => {
                  // Define the order details here
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          currency_code: 'USD',
                          value: paypalAmount.toFixed(2),
                        },
                      },
                    ],
                  });
                }}
                onApprove={( data, actions ) => {
                  // Handle the transaction approval and redirection here
                  return actions.order.capture().then((details) => {
                    // Handle the success and redirection
                    // You can redirect the user to a "Thank you" page or any other appropriate page.
                    console.log('Transaction completed by ' + details.payer.name.given_name);
                    console.log(details);

                    // Dispatch an action to clear the cart
                    dispatch(clearCart());

                    // Optionally, set an alert message or perform other actions
                   alert('Payment successful.');
                  });
                }}
              />
            </Button>
        </Grid>
        </>
      ) : (
        <h2>Cart is empty, please go to the products page and add to the cart.</h2>
      )}
    </div>
  );
};

export default Cart