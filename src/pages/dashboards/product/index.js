import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, selectAllProducts } from 'src/store/apps/product';
import { addToCart } from 'src/store/apps/cart';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Snackbar,
} from '@mui/material';

const Product = () => {
  const products = useSelector(selectAllProducts);
  const cartItems = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const isProductInCart = (productId) => {
    return cartItems.some((item) => item.id === productId);
  };

  const handleAddToCart = (product) => {
    if (!isProductInCart(product.id)) {
      dispatch(addToCart(product));
      setAlertMessage('Product Added to Cart');
    } else {
      setAlertMessage('Product is already in the cart');
    }

    // Clear the alert after 2 seconds
    setTimeout(() => {
      setAlertMessage('');
    }, 1000);
  };

  return (
    <div>
      <h2>Products</h2>
      <Grid container spacing={2}>
        {products.products && products.products.length > 0 && products.products.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card style={{height:"350px"}}>
              <CardMedia
                component="img"
                alt={product.title}
                height="150"
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
                  onClick={() => handleAddToCart(product)}
                  style={{ marginTop: '30px' }}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={alertMessage !== ''}
        message={alertMessage}
        autoHideDuration={2000} // Duration for the alert to be visible
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Position of the alert
        onClose={() => setAlertMessage('')}
      />
    </div>
  );
};

export default Product;
