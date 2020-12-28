#!/bin/sh

state=$1
address=$2
socks_port=$3
http_port=$4
pac_url=$5

services=$(networksetup -listnetworkserviceorder | grep 'Hardware Port')

while read line; do
    sname=$(echo $line | awk -F  "(, )|(: )|[)]" '{print $2}')
    sdev=$(echo $line | awk -F  "(, )|(: )|[)]" '{print $4}')
    #echo "Current service: $sname, $sdev, $currentservice"
    if [ -n "$sdev" ]; then
        ifout="$(ifconfig $sdev 2>/dev/null)"
        echo "$ifout" | grep 'status: active' > /dev/null 2>&1
        rc="$?"
        if [ "$rc" -eq 0 ]; then
            currentservice="$sname"
            currentdevice="$sdev"
            currentmac=$(echo "$ifout" | awk '/ether/{print $2}')

            # may have multiple active devices, so echo it here
            # echo "$currentservice, $currentdevice, $currentmac"

            if [ "$state" = "all" ]; then
                networksetup -setwebproxy "$currentservice" $address $http_port
                networksetup -setsecurewebproxy "$currentservice" $address $http_port
                networksetup -setsocksfirewallproxy "$currentservice" $address $socks_port
                echo "start all proxy"
            elif [ "$state" = "pac" ]; then
                networksetup -setautoproxystate "$currentservice" on
                networksetup -setautoproxyurl "$currentservice" $pac_url
                echo "start pac proxy"
            elif [ "$state" = "off" ]; then
                networksetup -setwebproxystate "$currentservice" off
                networksetup -setsecurewebproxystate "$currentservice" off
                networksetup -setsocksfirewallproxystate "$currentservice" off
                networksetup -setautoproxystate "$currentservice" off
                echo "stop socks proxy"
            else
                echo "invalid argument"
            fi
        fi
    fi
done <<< "$(echo "$services")"

if [ -z "$currentservice" ]; then
    >&2 echo "Could not find current service"
    exit 1
fi
