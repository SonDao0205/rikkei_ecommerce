-- LOCAL DEVELOPMENT SEED ONLY.
-- Safe to re-run: fixed IDs and unique business keys are upserted.
-- Do not use this file against production or shared environments.
SET NAMES utf8mb4;
START TRANSACTION;

-- Auth test accounts all use LocalTest123! (bcrypt, cost 12).
-- These are intentionally local-only accounts; never reuse their hash or password.
INSERT INTO users (id,email,phone,password_hash,full_name,email_verified,status,role) VALUES
 (900001,'seed-admin@local.test','+84910000001','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Local Seed Admin',1,'ACTIVE','admin'),
 (900002,'seed-seller-a@local.test','+84910000002','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Local Seller A',1,'ACTIVE','seller'),
 (900003,'seed-buyer@local.test','+84910000003','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Local Buyer',1,'ACTIVE','client'),
 (900004,'seed-seller-b@local.test','+84910000004','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Local Seller B',1,'ACTIVE','seller'),
 (900005,'seed-locked@local.test','+84910000005','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Local Locked User',1,'LOCKED','client'),
 (900006,'seed-unverified@local.test','+84910000006','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Local Unverified User',0,'ACTIVE','client'),
 (900007,'seed-seller-tech@local.test','+84910000007','$2a$12$lk6XmQ5LPsgzOv8RKJmux.tjH81CcAGXZHCboFl099d6B8.mHTzgO','Local Tech Seller',1,'ACTIVE','seller')
ON DUPLICATE KEY UPDATE email=VALUES(email),phone=VALUES(phone),password_hash=VALUES(password_hash),full_name=VALUES(full_name),email_verified=VALUES(email_verified),status=VALUES(status),role=VALUES(role);

INSERT INTO addresses (id,user_id,recipient_name,phone,province,district,ward,street_detail,is_default) VALUES
 (910001,900003,'Local Buyer','+84910000003','Hà Nội','Cầu Giấy','Dịch Vọng','12 Phố Duy Tân',1),
 (910002,900002,'Local Seller A','+84910000002','Hồ Chí Minh','Quận 1','Bến Nghé','25 Nguyễn Huệ',1)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),recipient_name=VALUES(recipient_name),phone=VALUES(phone),province=VALUES(province),district=VALUES(district),ward=VALUES(ward),street_detail=VALUES(street_detail),is_default=VALUES(is_default);

INSERT INTO shops (id,owner_id,name,description,phone,warehouse_address,status,follower_count,approved_at) VALUES
 (920001,900002,'Mây Studio','Cửa hàng mẫu đồ dùng và thời trang tối giản.','+84910000012','Cầu Giấy, Hà Nội','ACTIVE',1,UTC_TIMESTAMP()),
 (920002,900004,'Bếp Nhà Mộc','Cửa hàng mẫu đồ gia dụng và cà phê.','+84910000014','Quận 1, TP Hồ Chí Minh','PENDING',0,NULL),
 (920003,900007,'Tech World','Cửa hàng thiết bị công nghệ mẫu dùng để thử tìm kiếm sản phẩm.','+84910000017','Quận 3, TP Hồ Chí Minh','ACTIVE',0,UTC_TIMESTAMP())
ON DUPLICATE KEY UPDATE owner_id=VALUES(owner_id),description=VALUES(description),phone=VALUES(phone),warehouse_address=VALUES(warehouse_address),status=VALUES(status),follower_count=VALUES(follower_count),approved_at=VALUES(approved_at);

INSERT INTO shop_followers (shop_id,user_id) VALUES (920001,900003)
ON DUPLICATE KEY UPDATE shop_id=VALUES(shop_id);

INSERT INTO categories (id,parent_id,name,slug,sort_order,is_active) VALUES
 (930001,NULL,'Thời trang','seed-fashion',1,1),
 (930002,930001,'Áo và phụ kiện','seed-fashion-accessories',2,1),
 (930003,NULL,'Nhà cửa và đời sống','seed-home-living',3,1),
 (930004,NULL,'Thực phẩm và đồ uống','seed-food-drink',4,1),
 (930005,NULL,'Điện thoại và phụ kiện','seed-electronics',5,1)
ON DUPLICATE KEY UPDATE parent_id=VALUES(parent_id),name=VALUES(name),sort_order=VALUES(sort_order),is_active=VALUES(is_active);

INSERT INTO brands (id,name,slug,is_active) VALUES
 (940001,'Mây Basics','seed-may-basics',1),
 (940002,'Nhà Mộc','seed-nha-moc',1),
 (940003,'Apple','seed-apple',1)
ON DUPLICATE KEY UPDATE name=VALUES(name),is_active=VALUES(is_active);

INSERT INTO attributes (id,name) VALUES (950001,'Màu sắc'),(950002,'Kích cỡ')
ON DUPLICATE KEY UPDATE name=VALUES(name);
INSERT INTO attribute_values (id,attribute_id,value) VALUES
 (951001,950001,'Đen'),(951002,950001,'Trắng'),(951003,950002,'M'),(951004,950002,'L')
ON DUPLICATE KEY UPDATE attribute_id=VALUES(attribute_id),value=VALUES(value);

INSERT INTO products (id,shop_id,category_id,brand_id,name,slug,description,thumbnail_url,price,sold_count,rating_avg,rating_count,status,is_deleted) VALUES
 (960001,920001,930002,940001,'Áo thun cotton cơ bản','seed-cotton-tee','Sản phẩm mẫu để phát triển catalog và tồn kho.','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',250000,18,4.80,4,'ACTIVE',0),
 (960002,920001,930002,940001,'Túi vải dùng hằng ngày','seed-canvas-tote','Sản phẩm mẫu có nhiều biến thể màu.','https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',180000,7,4.50,2,'ACTIVE',0),
 (960003,920002,930004,940002,'Cà phê rang xay','seed-roasted-coffee','Sản phẩm mẫu của shop đang chờ duyệt.','https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',145000,0,0,0,'PENDING',0),
 (960004,920003,930005,940003,'Apple iPhone 15 Pro Max 256GB','seed-iphone-15-pro-max-256gb','Điện thoại mẫu để kiểm thử tìm kiếm nhiều từ khóa không liền nhau.','https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',29990000,250,4.90,42,'ACTIVE',0),
 (960005,920003,930005,940003,'Apple iPhone 15 Pro 128GB','seed-iphone-15-pro-128gb','Điện thoại mẫu có một phần từ khóa tìm kiếm tương tự.','https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',25990000,180,4.80,31,'ACTIVE',0),
 (960006,920003,930005,940003,'Apple iPhone 15 128GB','seed-iphone-15-128gb','Điện thoại mẫu cơ bản để so sánh tỷ lệ khớp từ khóa.','https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',19990000,120,4.70,24,'ACTIVE',0),
 (960007,920003,930005,NULL,'Ốp lưng MagSafe cho iPhone 15 Pro Max','seed-iphone-15-pro-max-case','Phụ kiện mẫu giúp kiểm tra xếp hạng theo tỷ lệ từ khóa trong tên.','https://images.unsplash.com/photo-1603313011105-34b1b4e5e9f1?w=800',390000,80,4.60,17,'ACTIVE',0),
 (960008,920003,930005,NULL,'Cáp USB-C sạc nhanh 20W','seed-usb-c-20w-cable','Phụ kiện công nghệ mẫu không chứa từ khóa iPhone.','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',190000,65,4.50,12,'ACTIVE',0)
ON DUPLICATE KEY UPDATE shop_id=VALUES(shop_id),category_id=VALUES(category_id),brand_id=VALUES(brand_id),name=VALUES(name),description=VALUES(description),thumbnail_url=VALUES(thumbnail_url),price=VALUES(price),sold_count=VALUES(sold_count),rating_avg=VALUES(rating_avg),rating_count=VALUES(rating_count),status=VALUES(status),is_deleted=VALUES(is_deleted);

INSERT INTO product_images (id,product_id,url,sort_order,is_primary) VALUES
 (960101,960001,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',1,1),
 (960102,960001,'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',2,0),
 (960103,960002,'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',1,1),
 (960104,960003,'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',1,1),
 (960105,960004,'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',1,1),
 (960106,960005,'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',1,1),
 (960107,960006,'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',1,1),
 (960108,960007,'https://images.unsplash.com/photo-1603313011105-34b1b4e5e9f1?w=800',1,1),
 (960109,960008,'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',1,1)
ON DUPLICATE KEY UPDATE product_id=VALUES(product_id),url=VALUES(url),sort_order=VALUES(sort_order),is_primary=VALUES(is_primary);

INSERT INTO product_variants (id,product_id,sku,name,price,stock,status) VALUES
 (961001,960001,'SEED-TEE-BLK-M','Đen / M',250000,24,'ACTIVE'),
 (961002,960001,'SEED-TEE-WHT-L','Trắng / L',250000,11,'ACTIVE'),
 (961003,960002,'SEED-TOTE-NAT','Màu tự nhiên',180000,35,'ACTIVE'),
 (961004,960003,'SEED-COFFEE-250','Túi 250g',145000,40,'ACTIVE'),
 (961005,960004,'SEED-IPHONE-15-PRO-MAX-256','iPhone 15 Pro Max / 256GB',29990000,12,'ACTIVE'),
 (961006,960005,'SEED-IPHONE-15-PRO-128','iPhone 15 Pro / 128GB',25990000,9,'ACTIVE'),
 (961007,960006,'SEED-IPHONE-15-128','iPhone 15 / 128GB',19990000,14,'ACTIVE'),
 (961008,960007,'SEED-IPHONE-15-PRO-MAX-CASE','Ốp lưng / Trong suốt',390000,30,'ACTIVE'),
 (961009,960008,'SEED-USB-C-20W-CABLE','Cáp USB-C / 1m',190000,45,'ACTIVE')
ON DUPLICATE KEY UPDATE product_id=VALUES(product_id),name=VALUES(name),price=VALUES(price),stock=VALUES(stock),status=VALUES(status);

INSERT INTO variant_attribute_values (variant_id,attribute_value_id) VALUES
 (961001,951001),(961001,951003),(961002,951002),(961002,951004)
ON DUPLICATE KEY UPDATE variant_id=VALUES(variant_id);

INSERT INTO stock_movements (id,variant_id,change_qty,stock_after,reason,created_by) VALUES
 (962001,961001,25,25,'RESTOCK',900002),
 (962002,961002,11,11,'RESTOCK',900002),
 (962003,961003,35,35,'RESTOCK',900002),
 (962004,961004,40,40,'RESTOCK',900004),
 (962005,961001,-1,24,'ORDER',900003),
 (962006,961004,-2,38,'ORDER',900003)
ON DUPLICATE KEY UPDATE variant_id=VALUES(variant_id),change_qty=VALUES(change_qty),stock_after=VALUES(stock_after),reason=VALUES(reason),created_by=VALUES(created_by);

INSERT INTO carts (id,user_id) VALUES (970001,900003)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);
INSERT INTO cart_items (id,cart_id,variant_id,quantity) VALUES (970101,970001,961001,2),(970102,970001,961003,1)
ON DUPLICATE KEY UPDATE cart_id=VALUES(cart_id),variant_id=VALUES(variant_id),quantity=VALUES(quantity);
INSERT INTO wishlists (user_id,product_id) VALUES (900003,960002)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id);

INSERT INTO shipping_methods (id,code,name,base_fee,estimated_days,is_active) VALUES
 (980001,'STANDARD','Giao hàng tiêu chuẩn',30000,'2-4 ngày',1),
 (980002,'EXPRESS','Giao hàng nhanh',50000,'1-2 ngày',1)
ON DUPLICATE KEY UPDATE name=VALUES(name),base_fee=VALUES(base_fee),estimated_days=VALUES(estimated_days),is_active=VALUES(is_active);
INSERT INTO payment_methods (id,code,name,is_active,sort_order) VALUES
 (980101,'COD','Thanh toán khi nhận hàng',1,1),
 (980102,'BANK_TRANSFER','Chuyển khoản ngân hàng',1,2),
 (980103,'MOCK_CARD','Thẻ thử nghiệm (không kết nối cổng thanh toán)',1,3)
ON DUPLICATE KEY UPDATE name=VALUES(name),is_active=VALUES(is_active),sort_order=VALUES(sort_order);

INSERT INTO vouchers (id,code,scope,shop_id,title,description,discount_type,discount_value,max_discount_amount,min_order_value,usage_limit,usage_per_user,used_count,start_at,end_at,is_active,created_by) VALUES
 (981001,'SEED-WELCOME','PLATFORM',NULL,'Ưu đãi mẫu toàn sàn','Voucher dữ liệu local để phát triển nghiệp vụ.','FIXED',50000,NULL,300000,100,1,1,UTC_TIMESTAMP()-INTERVAL 1 DAY,UTC_TIMESTAMP()+INTERVAL 180 DAY,1,900001),
 (981002,'SEED-MAY10','SHOP',920001,'Ưu đãi mẫu Mây Studio','Giảm phần trăm, có giới hạn tối đa.','PERCENT',10,40000,200000,50,1,1,UTC_TIMESTAMP()-INTERVAL 1 DAY,UTC_TIMESTAMP()+INTERVAL 90 DAY,1,900002)
ON DUPLICATE KEY UPDATE scope=VALUES(scope),shop_id=VALUES(shop_id),title=VALUES(title),description=VALUES(description),discount_type=VALUES(discount_type),discount_value=VALUES(discount_value),max_discount_amount=VALUES(max_discount_amount),min_order_value=VALUES(min_order_value),usage_limit=VALUES(usage_limit),usage_per_user=VALUES(usage_per_user),used_count=VALUES(used_count),start_at=VALUES(start_at),end_at=VALUES(end_at),is_active=VALUES(is_active),created_by=VALUES(created_by);

INSERT INTO orders (id,order_code,user_id,recipient_name,recipient_phone,shipping_address,payment_method_id,shipping_method_id,platform_voucher_id,subtotal,shipping_fee,platform_discount,shop_discount_total,total_amount,note) VALUES
 (990001,'SEED-ORDER-001',900003,'Local Buyer','+84910000003','12 Phố Duy Tân, Dịch Vọng, Cầu Giấy, Hà Nội',980101,980001,981001,540000,30000,50000,25000,495000,'Đơn hàng mẫu đã hoàn tất để kiểm thử lịch sử và đánh giá.')
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),recipient_name=VALUES(recipient_name),recipient_phone=VALUES(recipient_phone),shipping_address=VALUES(shipping_address),payment_method_id=VALUES(payment_method_id),shipping_method_id=VALUES(shipping_method_id),platform_voucher_id=VALUES(platform_voucher_id),subtotal=VALUES(subtotal),shipping_fee=VALUES(shipping_fee),platform_discount=VALUES(platform_discount),shop_discount_total=VALUES(shop_discount_total),total_amount=VALUES(total_amount),note=VALUES(note);

INSERT INTO shop_orders (id,order_id,shop_id,shop_order_code,status,subtotal,shipping_fee,shop_voucher_id,shop_discount,platform_discount,total_amount,commission_rate,commission_amount,carrier,tracking_code,confirmed_at,packed_at,shipped_at,completed_at) VALUES
 (991001,990001,920001,'SEED-SHOP-ORDER-001','COMPLETED',250000,20000,981002,25000,15000,230000,8,18400,'Local Express','SEED-TRACK-001',UTC_TIMESTAMP()-INTERVAL 4 DAY,UTC_TIMESTAMP()-INTERVAL 3 DAY,UTC_TIMESTAMP()-INTERVAL 2 DAY,UTC_TIMESTAMP()-INTERVAL 1 DAY),
 (991002,990001,920002,'SEED-SHOP-ORDER-002','COMPLETED',290000,10000,NULL,0,35000,265000,8,21200,'Local Express','SEED-TRACK-002',UTC_TIMESTAMP()-INTERVAL 4 DAY,UTC_TIMESTAMP()-INTERVAL 3 DAY,UTC_TIMESTAMP()-INTERVAL 2 DAY,UTC_TIMESTAMP()-INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE order_id=VALUES(order_id),shop_id=VALUES(shop_id),status=VALUES(status),subtotal=VALUES(subtotal),shipping_fee=VALUES(shipping_fee),shop_voucher_id=VALUES(shop_voucher_id),shop_discount=VALUES(shop_discount),platform_discount=VALUES(platform_discount),total_amount=VALUES(total_amount),commission_rate=VALUES(commission_rate),commission_amount=VALUES(commission_amount),carrier=VALUES(carrier),tracking_code=VALUES(tracking_code),confirmed_at=VALUES(confirmed_at),packed_at=VALUES(packed_at),shipped_at=VALUES(shipped_at),completed_at=VALUES(completed_at);

INSERT INTO order_items (id,shop_order_id,product_id,variant_id,product_name,variant_name,sku,image_url,unit_price,quantity,line_total) VALUES
 (992001,991001,960001,961001,'Áo thun cotton cơ bản','Đen / M','SEED-TEE-BLK-M','https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',250000,1,250000),
 (992003,991002,960003,961004,'Cà phê rang xay','Túi 250g','SEED-COFFEE-250','https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800',145000,2,290000)
ON DUPLICATE KEY UPDATE shop_order_id=VALUES(shop_order_id),product_id=VALUES(product_id),variant_id=VALUES(variant_id),product_name=VALUES(product_name),variant_name=VALUES(variant_name),sku=VALUES(sku),image_url=VALUES(image_url),unit_price=VALUES(unit_price),quantity=VALUES(quantity),line_total=VALUES(line_total);

INSERT INTO order_status_history (id,shop_order_id,from_status,to_status,changed_by,note) VALUES
 (993001,991001,NULL,'PENDING',900003,'Đơn hàng mẫu được tạo.'),
 (993002,991001,'PENDING','COMPLETED',900002,'Cập nhật mẫu tới trạng thái hoàn tất.'),
 (993003,991002,NULL,'PENDING',900003,'Đơn hàng mẫu được tạo.'),
 (993004,991002,'PENDING','COMPLETED',900004,'Cập nhật mẫu tới trạng thái hoàn tất.')
ON DUPLICATE KEY UPDATE shop_order_id=VALUES(shop_order_id),from_status=VALUES(from_status),to_status=VALUES(to_status),changed_by=VALUES(changed_by),note=VALUES(note);

INSERT INTO voucher_usages (id,voucher_id,user_id,order_id,discount_amount) VALUES
 (994001,981001,900003,990001,50000),
 (994002,981002,900003,990001,25000)
ON DUPLICATE KEY UPDATE voucher_id=VALUES(voucher_id),user_id=VALUES(user_id),order_id=VALUES(order_id),discount_amount=VALUES(discount_amount);
INSERT INTO payments (id,order_id,payment_method_id,amount,status,transaction_ref,provider_data,paid_at) VALUES
 (995001,990001,980101,495000,'PAID','SEED-PAYMENT-001',JSON_OBJECT('source','local-seed','gateway','mock'),UTC_TIMESTAMP()-INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE order_id=VALUES(order_id),payment_method_id=VALUES(payment_method_id),amount=VALUES(amount),status=VALUES(status),transaction_ref=VALUES(transaction_ref),provider_data=VALUES(provider_data),paid_at=VALUES(paid_at);

INSERT INTO return_requests (id,shop_order_id,user_id,type,reason,status,refund_amount,handled_by,handled_note) VALUES
 (996001,991001,900003,'REFUND','Dữ liệu mẫu yêu cầu hoàn tiền.','REQUESTED',NULL,NULL,NULL)
ON DUPLICATE KEY UPDATE shop_order_id=VALUES(shop_order_id),user_id=VALUES(user_id),type=VALUES(type),reason=VALUES(reason),status=VALUES(status),refund_amount=VALUES(refund_amount),handled_by=VALUES(handled_by),handled_note=VALUES(handled_note);
INSERT INTO reviews (id,order_item_id,product_id,shop_id,user_id,rating,content,status,shop_reply,shop_replied_at) VALUES
 (997001,992001,960001,920001,900003,5,'Dữ liệu mẫu đánh giá sản phẩm.','VISIBLE','Cảm ơn bạn đã ủng hộ cửa hàng.',UTC_TIMESTAMP()-INTERVAL 1 DAY)
ON DUPLICATE KEY UPDATE order_item_id=VALUES(order_item_id),product_id=VALUES(product_id),shop_id=VALUES(shop_id),user_id=VALUES(user_id),rating=VALUES(rating),content=VALUES(content),status=VALUES(status),shop_reply=VALUES(shop_reply),shop_replied_at=VALUES(shop_replied_at);
INSERT INTO review_images (id,review_id,url) VALUES
 (998001,997001,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800')
ON DUPLICATE KEY UPDATE review_id=VALUES(review_id),url=VALUES(url);
INSERT INTO notifications (id,user_id,type,title,content,link_url,is_read) VALUES
 (999001,900003,'ORDER_STATUS','Đơn hàng đã hoàn tất','Thông báo mẫu để phát triển danh sách thông báo.','/orders/SEED-ORDER-001',0),
 (999002,900002,'PROMOTION','Chào mừng người bán','Thông báo mẫu cho tài khoản người bán.','/seller',1)
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),type=VALUES(type),title=VALUES(title),content=VALUES(content),link_url=VALUES(link_url),is_read=VALUES(is_read);
INSERT INTO audit_logs (id,user_id,action,entity_type,entity_id,old_value,new_value,ip_address) VALUES
 (1000001,900001,'SEED_CREATED','PRODUCT',960001,NULL,JSON_OBJECT('source','local-seed'), '127.0.0.1')
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id),action=VALUES(action),entity_type=VALUES(entity_type),entity_id=VALUES(entity_id),old_value=VALUES(old_value),new_value=VALUES(new_value),ip_address=VALUES(ip_address);

-- No rows are seeded into refresh_tokens, auth_refresh_history, or
-- password_reset_otps: these are live security state, not fixture data.
COMMIT;
