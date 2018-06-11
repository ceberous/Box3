#!/usr/bin/python

import smtplib
from email.MIMEMultipart import MIMEMultipart
from email.MIMEText import MIMEText

import sys
from time import localtime, strftime
from datetime import datetime
from pytz import timezone

eastern_tz = timezone('US/Eastern')
pacific_tz = timezone('US/Pacific')

#print sys.argv[1] #1  = From
#print sys.argv[2] #2  = FromPass
#print sys.argv[3] #3  = To
#print sys.argv[4] #4  = Subject
#print sys.argv[5] #5  = Message

wMessage = MIMEMultipart()
wMessage['From'] = sys.argv[1]
wMessage['To'] = sys.argv[3]
wMessage['Subject'] = sys.argv[4]
wMessage.attach( MIMEText( sys.argv[5] ) )

try:
	server = smtplib.SMTP( "mail.gmx.com" , 587 )
	server.ehlo()
	server.starttls()
	server.ehlo()
	server.login( sys.argv[1] ,  sys.argv[2]  )
	server.sendmail( sys.argv[1] , sys.argv[3] , wMessage.as_string() )
	server.close()
	print('sent email')
except Exception as e:
	print e
	print('failed to send email')