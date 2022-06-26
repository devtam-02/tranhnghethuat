import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrderIDsuccess } from "../../redux/orderSlice";
import ScaleLoader from "react-spinners/ScaleLoader";
import Moment from "react-moment";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import ModalAdmin from "./../../components/ModalAdmin/index";


const Order = () => {
  const dispatch = useDispatch();
  const { orderID } = useSelector((state) => state.order);
  const { userInfo } = useSelector((state) => state.auth);
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!userInfo?.auth) {
      router.push("/")
    }
  }, [userInfo?.auth]);

  useEffect(() => {
    if (userInfo?.accessToken) {
      setLoading(true)
      axios
        .get(`http://localhost:4000/api/order/getorderuser/${userInfo?.user?.id}`)
        .then((data) => {
          setLoading(false)
          dispatch(getOrderIDsuccess(data.data))
        })
        .catch((err) => {
          setLoading(false)
        });
    }
  }, [userInfo]);

  
  return (
    <>
      <Head>
        <title>Check đơn hàng </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="order_box">
        {loading ? (
          <div class="loading-box">
            <ScaleLoader size={300} color="#cd1818" />
          </div>
        ) : (
          <div className="table-box">
            <h2 className="profile_title">Danh sách sản phẩm đã đặt</h2>
            <table class="styled-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Sản phẩm</th>
                  <th>Số điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Loại thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Thời gian đặt</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tbody>
                {openModal && (
                  <ModalAdmin
                    setItems={setItems}
                    setOpenModal={setOpenModal}
                    items={items}
                  />
                )}
                {orderID &&
                  orderID.map((order, i) => (
                    <tr>
                      <td>{i+1}</td>
                      <td
                        onClick={() => {
                          setOpenModal(true);
                          setItems(order.items);
                        }}
                        className="xem"
                      >
                        Xem...
                      </td>
                      <td>{order.phone}</td>
                      <td>{order.address}</td>
                      <td>{order.paymentType}</td>
                      <td
                        className={`${order.status}` ? "red_text" : "blue_text"}
                      >
                        {order.status ? "Đã chuyển" : "Đang xử lý"}
                      </td>
                      <td>{<Moment locale="vi" fromNow ago date={order.createdAt} />} trước</td>
                      <td className="code_td">{order.code ? `${order.code}` : <i class="fa-solid fa-x"></i> }</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Order;