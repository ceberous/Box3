import sys
import Skype4Py
import time

# sudo apt-get install python-dbus
# http://web.archive.org/web/20130607130426/http://dev.skype.com/desktop-api-reference#Linux
print sys.argv[1]

CALL_LIVE = False
CallStatus = 0
callobj1 = 0
retryCount = 0

CallIsFinished = set ([Skype4Py.clsFailed, Skype4Py.clsFinished, Skype4Py.clsMissed, Skype4Py.clsRefused, Skype4Py.clsBusy, Skype4Py.clsCancelled]);

def AttachmentStatusText(status):
   return skype.Convert.AttachmentStatusToText(status)

def CallStatusText(status):
    return skype.Convert.CallStatusToText(status)

def OnCall(call, status):
    global CALL_LIVE
    global CallStatus
    global callobj1
    global skype
    global retryCount
    CallStatus = status
    wText = CallStatusText(status)
    wText = [ s.strip() for s in wText.splitlines() ]
    wText = wText[-1]
    #print wText
    if ( wText == "Recording" ):
        time.sleep(5)
        call.Finish()
        print("EndedCall")
        sys.stdout.flush()
        CallStatus = Skype4Py.clsFinished
        sys.exit(1)
        raise SystemExit

    # elif ( wText == "Uploading Voicemail" ):
    #     print( "UploadingVoicemail" )
    #     sys.stdout.flush()
    #     time.sleep(2)
    #     #sys.exit(1)
    #     CallStatus = CallIsFinished[0]
    #     sys.exit(1)        
    #     raise SystemExit
    #     return

    elif ( wText == "Voicemail Has Been Sent" ):
        print( "VoicemailSent" )
        sys.stdout.flush()
        time.sleep(2)
        #sys.exit(1)
        CallStatus = Skype4Py.clsFinished
        sys.exit(1)
        raise SystemExit
        return        

    elif ( wText == "Never placed" ):
        #call.Finish()
        if ( retryCount < 3 ):
            retryCount = retryCount + 1
            time.sleep(2)
            makeCall()
        else:        
            print("NeverPlaced")
            sys.stdout.flush()
            call.Finish()
            #sys.exit(1)
            CallStatus = Skype4Py.clsFinished
            sys.exit(1)
            raise SystemExit
            return

    elif ( wText == "Sorry, call failed!" ):
        #call.Finish()
        if ( retryCount < 3 ):
            retryCount = retryCount + 1
            time.sleep(2)
            makeCall()
        else:
            print("CallFailed")
            sys.stdout.flush()
            #sys.exit(1)
            CallStatus = Skype4Py.clsFinished
            sys.exit(1)
            raise SystemExit
            return

    elif ( wText == "Cancelled" ):
    	if ( retryCount < 3 ):
    		retryCount = retryCount + 1
    		time.sleep(2)
    		makeCall()

    elif ( wText == "Finished" ):
        if CALL_LIVE == False:
            if ( retryCount < 3 ):
                retryCount = retryCount + 1
                time.sleep(2)
                makeCall()
        else:
            print( "Finished" )
            sys.stdout.flush()

    elif ( wText == "Call in Progress" ):
        CALL_LIVE = True
        print( "CallLive" )
        sys.stdout.flush()

    elif ( wText == "API attachment status: Refused" ):
        print "SkypeAPIDown"
        sys.stdout.flush()
        CallStatus = Skype4Py.clsFinished
        sys.exit(1)
        raise SystemExit
        return
   
    #else:
        #print 'Call status: ' + wText
        #sys.stdout.flush()

def OnAttach(status): 
    #print 'API attachment status: ' + AttachmentStatusText(status)
    sys.stdout.flush()
    if status == Skype4Py.apiAttachAvailable:
        skype.Attach()


'''
def OnVideo( call , status):
    print(status)
    #sys.stdout.flush()

def OnVideoSend( call , status):
    print(status)
    #sys.stdout.flush()

def OnVideoRecieved( call , status):
    print(status)
    #sys.stdout.flush()
'''


skype = Skype4Py.Skype()
skype.OnAttachmentStatus = OnAttach
skype.OnCallStatus = OnCall
#skype.OnCallVideoStatusChanged = OnVideo
#skype.OnCallVideoSendStatusChanged = OnVideoSend
#skype.OnCallVideoReceiveStatusChanged = OnVideoRecieved


# Starting Skype if it's not running already..
if not skype.Client.IsRunning:
    print 'Starting Skype..'
    skype.Client.Start()


# Attatching to Skype..
print 'Connecting to Skype..'
skype.Attach()


def makeCall():
    callingName = sys.argv[1]
    #print 'Calling ' + callingName + '..'
    callobj1 = skype.PlaceCall(callingName)
    # Loop until CallStatus gets one of "call terminated" values in OnCall handler
    while not CallStatus in CallIsFinished:
        pass
    sys.exit(1)
    return


makeCall()