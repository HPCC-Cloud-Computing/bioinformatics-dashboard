# Bio Informatics Dashboard

## Prerequisites & Requirements ##

* Ubuntu Server 14.04 LTS
* OpenStack Kilo with Nova, Neutron, Swift, Heat with Docker Resource([Install Guide](https://www.evernote.com/shard/s520/sh/548c014f-25b2-4506-9f34-32731a071682/be4509f657ff26f168b147570993e48c))
* Docker engine version <= 1.7.x with docker api version <= 1.19.
  
  ```
  sudo apt-get install docker-engine=1.7.1-0~trusty
  ```

## Setup Instructions ##

1. Clone the repository into your local OpenStack directory:
    
    ```
    git clone https://github.com/cloudcomputinghust/bioinformatics-dashboard.git
    ```

2. Copy bioinformatics folder to /usr/share/openstack-dashboard/openstack_dashboard/dashboards

    ```
    cp bioinformatics /usr/share/openstack-dashboard/openstack_dashboard/dashboards
    ```

3. Create link to /usr/share/openstack-dashboard/static/bioinformatics
    
    ```
    ln -s /usr/share/openstack-dashboard/openstack_dashboard/dashboards/bioinformatics/static/bioinformatics/ \ 
    /usr/share/openstack-dashboard/static/bioinformatics/
    ```

4. Copy file _50_bioinformatics.py to /usr/share/openstack-dashboard/openstack_dashboard/enabled/
    
    ```
    cp _50_bioinformatics.py /usr/share/openstack-dashboard/openstack_dashboard/enabled/
    ```

