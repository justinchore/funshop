import React, { useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Meta from '../components/Meta';
import Paginate from '../components/Paginate';
import Message from '../components/Message';
import Loader from '../components/Loader';
import {
  listProducts,
  deleteProduct,
  createProduct,
} from '../actions/productActions';
import {
  PRODUCT_DELETE_RESET,
  PRODUCT_CREATE_RESET,
} from '../constants/productConstants';

const ProductListScreen = ({ history, match }) => {
  const pageNumber = match.params.pageNumber || 1;

  const dispatch = useDispatch();

  const productList = useSelector(state => state.productList);
  const { products, loading, error, pages, page } = productList;

  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  const productDelete = useSelector(state => state.productDelete);
  const {
    success: deleteSuccess,
    loading: deleteLoading,
    error: deleteError,
  } = productDelete;

  const productCreate = useSelector(state => state.productCreate);
  const {
    success: createSuccess,
    loading: createLoading,
    error: createError,
    product: createdProduct,
  } = productCreate;

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET });

    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login');
    }

    if (createSuccess) {
      history.push(`/admin/product/${createdProduct._id}/edit`);
    } else {
      dispatch({ type: PRODUCT_DELETE_RESET });
      dispatch(listProducts('', pageNumber));
    }
  }, [
    dispatch,
    userInfo,
    history,
    deleteSuccess,
    createSuccess,
    createdProduct,
    pageNumber,
  ]);

  const deleteHandler = id => {
    if (window.confirm('Are you sure?')) {
      dispatch(deleteProduct(id));
    }
  };

  const createProductHandler = () => {
    dispatch(createProduct());
  };

  return (
    <>
      <Meta title='Product List' />
      <Row className='align-items-center'>
        <Col>
          <h1>Products</h1>
        </Col>
        {deleteSuccess && <Message variant='success'>Product Deleted</Message>}
        <Col className='text-right'>
          <Button className='my-3' onClick={createProductHandler}>
            <i className='fas fa-plus'></i> Create Product
          </Button>
        </Col>
      </Row>
      {deleteLoading && <Loader />}
      {deleteError && <Message variant='danger'>{deleteError}</Message>}
      {createLoading && <Loader />}
      {createError && <Message variant='danger'>{createError}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm'>
                        <i className='fas fa-edit'></i>
                      </Button>
                    </LinkContainer>
                  </td>
                  <td>
                    <Button
                      variant='danger'
                      className='btn-sm'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={pages} page={page} isAdmin={true} />
        </>
      )}
    </>
  );
};

export default ProductListScreen;
