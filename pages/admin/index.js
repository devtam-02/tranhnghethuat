import styles from "../../styles/Admin.module.css";
import { fotmatMoney, calculateTotal } from "../../function/utils";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useDispatch } from "react-redux";
import { updateStatus } from "../../redux/orderSlice";
import axios from "axios";
import Head from "next/head";
import ModalAdmin from "../../components/ModalAdmin";
import Moment from "react-moment";
import apiModule from '../../http'
import Noty from "noty";

const Admin = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { updateSuccess } = useSelector((state) => state.order);
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [valueChange, setValueChange] = useState(null);
  const [items, setItems] = useState([]);
  const [idOrder, setIdOrder] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const dispatch = useDispatch();
  const {deleteorder} = apiModule()

  useEffect(() => {
    if (userInfo?.accessToken) {
      setLoading(true);
      axios
        .get("http://localhost:4000/api/order", {
          headers: {
            Authorization: `Bearer ${userInfo?.accessToken}`,
          },
        })
        .then((data) => {
          setData(data.data);
          setLoading(false);
        })
        .catch((err) => console.log(err));
    }
  }, [userInfo, loadingDelete]);

  useEffect(() => {
    if (!userInfo?.user.isAdmin) {
      router.push("/");
    }
  }, [userInfo?.user.isAdmin]);

  const setIdOrder2 = (id) => {
    setIdOrder(id);
  };

  useEffect(() => {
      dispatch(updateStatus({ status: valueChange, orderId: idOrder }));
  }, [idOrder, valueChange]);

  useEffect(() => {
    if (updateSuccess) {
      router.reload();
    }
  }, [updateSuccess]);

  const handleDelte = async (id) => {
    try {
      setLoadingDelete(true)
      const {data} = await deleteorder(id)
      if(data?.success) {
        setLoadingDelete(false)
        new Noty({
          type: "success",
          timeout: 1000,
          text: "Xóa thành công",
          progressBar: false,
        }).show();
        return
      }
    } catch (error) {
      setLoadingDelete(false)
        new Noty({
          type: "error",
          timeout: 1000,
          text: "Lỗi server",
          progressBar: false,
        }).show();
    }
  }

  return (
    <div className={styles.admin_page}>
      <Head>
        <title>Kiểm tra đơn hàng</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.box_admin}>
        <div className={styles.list_order}>
          <h2 className="profile_title">Xử lý đơn hàng</h2>

          <div className="table-box_2">
            {loading ? (
              <div class="loading-box">
                <ScaleLoader size={300} color="#cd1818" />
              </div>
            ) : (
              <table class="styled-table">
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Trạng thái</th>
                    <th>Địa chỉ</th>
                    <th>Số điện thoại</th>
                    <th>Sản phẩm</th>
                    <th>Thanh toán qua</th>
                    <th>Tổng tiền</th>
                    <th>Code</th>
                    <th>Xác nhận</th>
                    <th>Đặt lúc</th>
                    <th>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((order) => (
                    <>
                    {openModal && <ModalAdmin setItems={setItems} setOpenModal={setOpenModal} items={items}/>}
                      <tr>
                        <td>{order.customerId?.name}</td>
                        <td>{order.status ? "Đã chuyển" : "Đang xử lý"}</td>
                        <td>{order.address}</td>
                        <td>{order.phone}</td>
                        <td onClick={() => {
                          setOpenModal(true)
                          setItems(order.items)
                        }} className="link_view">Xem...</td>
                        <td className="payment">{order.paymentType}</td>
                        <td className="money">
                          {fotmatMoney(calculateTotal(order.items))}
                        </td>
                        <td className="code_td">{order.code}</td>
                        <td>
                          <select
                          className="select_order"
                            onChange={(e) => {
                              setIdOrder2(order._id);
                              setValueChange(e.target.value);
                            }}
                          >
                            <option value="">Thay đổi</option>
                            <option value="false">Đang xử lý</option>
                            <option value="true">Đã chuyển</option>
                          </select>
                        </td>
                        <td>{<Moment locale="vi" fromNow ago date={order.createdAt} />} trước</td>
                        <td><i onClick={() => handleDelte(order._id)} class="block_pr fa-solid fa-trash-can"></i></td>
                      </tr>
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
