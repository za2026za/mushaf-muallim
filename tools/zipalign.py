import zipfile,sys
src,out=sys.argv[1:3]
zi=zipfile.ZipFile(src);zo=zipfile.ZipFile(out,"w")
for i in zi.infolist():
    data=zi.read(i.filename)
    n=zipfile.ZipInfo(i.filename,date_time=i.date_time);n.compress_type=i.compress_type;n.external_attr=i.external_attr
    if i.compress_type==0:
        hdr=zo.fp.tell()+30+len(i.filename.encode())
        pad=(-(hdr+4))%4  # 4-byte align data; extra header id(2)+len(2)+pad
        n.extra=b"\xfe\xca"+pad.to_bytes(2,"little")+b"\0"*pad if True else b""
    zo.writestr(n,data)
zo.close()
z=zipfile.ZipFile(out)
for i in z.infolist():
    if i.compress_type==0:
        off=i.header_offset+30+len(i.filename.encode())+len(i.extra)
        assert off%4==0,(i.filename,off)
print("aligned")
