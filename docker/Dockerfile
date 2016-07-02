FROM ubuntu:latest

ADD https://deb.nodesource.com/setup_6.x /root/setup_6.x
RUN bash /root/setup_6.x
RUN apt-get -y upgrade
RUN apt-get install -y firefox nodejs xvfb git bzip2
RUN npm install -g bls/snap-and-sniff
RUN mkdir /data
WORKDIR /data
# CMD ["xvfb-run", "snap-and-sniff"]
