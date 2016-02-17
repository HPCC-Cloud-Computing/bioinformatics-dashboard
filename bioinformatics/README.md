# Bio Informatics Dashboard

1. Cài đặt trực tiếp trên hệ thống hpcc/bkcloud15:
    * Sử dụng SFTP, để chỉnh sửa & upload lên trực tiếp lên hpcc/bkcloud15.
    * Mỗi lần chỉnh sửa cần upload lên hpcc/bkcloud15 và push lên repository này.

2. Cài đặt trên máy ảo / máy tính cá nhân đã được cài đặt Openstack Kilo.
    * Clone Repository này về.
    * Copy folder bioinformatics vào thư mục /usr/share/openstack-dashboard/openstack_dashboard/dashboards.
    ```
    cp bioinformatics /usr/share/openstack-dashboard/openstack_dashboard/dashboards
    ```
    * Tạo link đến thư mục /usr/share/openstack-dashboard/static/bioinformatics
    ```
    ln -s /usr/share/openstack-dashboard/static/bioinformatics /usr/share/openstack-dashboard/openstack_dashboard/dashboards/bioinformatics/static/bioinformatics/
    ```
    * Copy file _50_bioinformatics.py đến thư mục /usr/share/openstack-dashboard/openstack_dashboard/enabled/
    ```
    cp _50_bioinformatics.py /usr/share/openstack-dashboard/openstack_dashboard/enabled/
    ```